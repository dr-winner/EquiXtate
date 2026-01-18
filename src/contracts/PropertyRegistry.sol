// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./KYCVerifier.sol";

/**
 * @title PropertyRegistry
 * @dev Manages property listing and registration on the platform
 * @notice Requires ENHANCED KYC tier for property listing
 * 
 * Security Features:
 * 1. KYC Verification: Only ENHANCED tier KYC users can list properties
 * 2. Duplicate Prevention: Properties are uniquely identified by document hash
 * 3. Oracle Verification: Off-chain verification before on-chain listing
 * 4. Ownership Tracking: Full audit trail of property ownership
 */
contract PropertyRegistry is Ownable, ReentrancyGuard {
    
    struct Property {
        uint256 id;
        address owner;
        string name;
        string location;
        uint256 value;
        address tokenAddress; // Associated PropertyToken contract
        bool isActive;
        uint256 listedAt;
        bytes32 documentHash; // Hash of deed/title documents for uniqueness
        bytes32 locationHash; // Hash of normalized location for duplicate detection
        string verificationId; // Off-chain verification reference
    }
    
    KYCVerifier public kycVerifier;
    address public verificationOracle; // Oracle that can approve property listings
    
    // Property ID => Property details
    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;
    
    // Owner => Property IDs
    mapping(address => uint256[]) public ownerProperties;
    
    // Document hash => Property ID (prevents duplicate document submissions)
    mapping(bytes32 => uint256) public documentHashToProperty;
    
    // Location hash => Property ID (prevents same property at same location)
    mapping(bytes32 => uint256) public locationHashToProperty;
    
    // Verification ID => Property ID (links off-chain verification to on-chain property)
    mapping(string => uint256) public verificationToProperty;
    
    // Pending property listings awaiting oracle approval
    mapping(uint256 => bool) public pendingApproval;
    
    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed owner,
        string name,
        uint256 value,
        bytes32 documentHash
    );
    event PropertyUpdated(uint256 indexed propertyId);
    event PropertyDeactivated(uint256 indexed propertyId);
    event PropertyVerified(uint256 indexed propertyId, string verificationId);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    constructor(address _kycVerifier, address _verificationOracle) Ownable(msg.sender) {
        require(_kycVerifier != address(0), "Invalid KYC verifier");
        require(_verificationOracle != address(0), "Invalid verification oracle");
        kycVerifier = KYCVerifier(_kycVerifier);
        verificationOracle = _verificationOracle;
    }
    
    modifier onlyOracle() {
        require(msg.sender == verificationOracle, "Only oracle can call");
        _;
    }
    
    /**
     * @dev Submit a property for listing (requires ENHANCED KYC tier)
     * @param name Property name
     * @param location Property address/location
     * @param value Property valuation
     * @param documentHash Keccak256 hash of the property deed/title document
     * @return propertyId The ID of the submitted property
     * 
     * NOTE: Property is NOT active until oracle verifies and approves it
     */
    function submitProperty(
        string memory name,
        string memory location,
        uint256 value,
        bytes32 documentHash
    ) external nonReentrant returns (uint256) {
        // Require ENHANCED KYC tier for property listing
        require(
            kycVerifier.canListProperties(msg.sender),
            "Enhanced KYC verification required to list properties"
        );
        
        require(bytes(name).length > 0, "Property name required");
        require(bytes(location).length > 0, "Property location required");
        require(value > 0, "Property value must be positive");
        require(documentHash != bytes32(0), "Document hash required");
        
        // DUPLICATE PREVENTION: Check if this document has already been submitted
        require(
            documentHashToProperty[documentHash] == 0,
            "Property with this deed document already exists"
        );
        
        // DUPLICATE PREVENTION: Check if property at this location already exists
        bytes32 locHash = keccak256(abi.encodePacked(_normalizeLocation(location)));
        require(
            locationHashToProperty[locHash] == 0,
            "Property at this location already listed"
        );
        
        propertyCount++;
        
        properties[propertyCount] = Property({
            id: propertyCount,
            owner: msg.sender,
            name: name,
            location: location,
            value: value,
            tokenAddress: address(0), // Set after tokenization
            isActive: false, // NOT active until oracle approves
            listedAt: block.timestamp,
            documentHash: documentHash,
            locationHash: locHash,
            verificationId: ""
        });
        
        // Register document and location hashes
        documentHashToProperty[documentHash] = propertyCount;
        locationHashToProperty[locHash] = propertyCount;
        
        ownerProperties[msg.sender].push(propertyCount);
        pendingApproval[propertyCount] = true;
        
        emit PropertyListed(propertyCount, msg.sender, name, value, documentHash);
        
        return propertyCount;
    }
    
    /**
     * @dev Oracle approves property after off-chain verification
     * @param propertyId The property to approve
     * @param verificationId Reference to off-chain verification record
     * @param tokenAddress The deployed PropertyToken contract address
     * 
     * This function is called by the verification oracle after:
     * 1. KRNL Protocol verifies property ownership against government records
     * 2. Document authenticity is verified
     * 3. Owner identity matches KYC records
     */
    function approveProperty(
        uint256 propertyId,
        string memory verificationId,
        address tokenAddress
    ) external onlyOracle {
        require(propertyId > 0 && propertyId <= propertyCount, "Invalid property ID");
        require(pendingApproval[propertyId], "Property not pending approval");
        require(bytes(verificationId).length > 0, "Verification ID required");
        
        Property storage property = properties[propertyId];
        property.isActive = true;
        property.verificationId = verificationId;
        property.tokenAddress = tokenAddress;
        
        pendingApproval[propertyId] = false;
        verificationToProperty[verificationId] = propertyId;
        
        emit PropertyVerified(propertyId, verificationId);
    }
    
    /**
     * @dev Oracle rejects property listing
     * @param propertyId The property to reject
     * 
     * Clears the document and location hashes so they can be resubmitted
     */
    function rejectProperty(uint256 propertyId) external onlyOracle {
        require(propertyId > 0 && propertyId <= propertyCount, "Invalid property ID");
        require(pendingApproval[propertyId], "Property not pending approval");
        
        Property storage property = properties[propertyId];
        
        // Clear the hash mappings so the same property can be resubmitted with corrections
        delete documentHashToProperty[property.documentHash];
        delete locationHashToProperty[property.locationHash];
        
        pendingApproval[propertyId] = false;
        
        emit PropertyDeactivated(propertyId);
    }
    
    /**
     * @dev Legacy function for backward compatibility - now requires oracle approval
     */
    function listProperty(
        string memory name,
        string memory location,
        uint256 value,
        address tokenAddress
    ) external nonReentrant returns (uint256) {
        // Generate document hash from property details (less secure, use submitProperty instead)
        bytes32 docHash = keccak256(abi.encodePacked(msg.sender, name, location, block.timestamp));
        return this.submitProperty(name, location, value, docHash);
    }
    
    /**
     * @dev Update property details (only owner, only active properties)
     */
    function updateProperty(
        uint256 propertyId,
        string memory name,
        uint256 value
    ) external {
        Property storage property = properties[propertyId];
        require(property.owner == msg.sender, "Not property owner");
        require(property.isActive, "Property not active");
        
        // Location cannot be changed (would require re-verification)
        property.name = name;
        property.value = value;
        
        emit PropertyUpdated(propertyId);
    }
    
    /**
     * @dev Deactivate a property (only owner or contract owner)
     */
    function deactivateProperty(uint256 propertyId) external {
        Property storage property = properties[propertyId];
        require(
            property.owner == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        require(property.isActive, "Already inactive");
        
        property.isActive = false;
        
        // Note: We keep the hash mappings to prevent re-listing the same property
        // If legitimate re-listing is needed, admin can call clearPropertyHashes
        
        emit PropertyDeactivated(propertyId);
    }
    
    /**
     * @dev Check if a property exists by document hash
     */
    function propertyExistsByDocument(bytes32 documentHash) external view returns (bool) {
        return documentHashToProperty[documentHash] != 0;
    }
    
    /**
     * @dev Check if a property exists at a location
     */
    function propertyExistsByLocation(string memory location) external view returns (bool) {
        bytes32 locHash = keccak256(abi.encodePacked(_normalizeLocation(location)));
        return locationHashToProperty[locHash] != 0;
    }
    
    /**
     * @dev Get property by document hash
     */
    function getPropertyByDocument(bytes32 documentHash) external view returns (Property memory) {
        uint256 propertyId = documentHashToProperty[documentHash];
        require(propertyId != 0, "Property not found");
        return properties[propertyId];
    }
    
    /**
     * @dev Normalize location string (lowercase, trim spaces)
     * Helps detect duplicate listings with slight variations
     */
    function _normalizeLocation(string memory location) internal pure returns (string memory) {
        bytes memory b = bytes(location);
        bytes memory result = new bytes(b.length);
        uint256 resultLength = 0;
        bool lastWasSpace = true; // Trim leading spaces
        
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            
            // Convert to lowercase
            if (char >= 0x41 && char <= 0x5A) { // A-Z
                char = bytes1(uint8(char) + 32);
            }
            
            // Handle spaces
            if (char == 0x20) {
                if (!lastWasSpace) {
                    result[resultLength++] = char;
                    lastWasSpace = true;
                }
            } else {
                result[resultLength++] = char;
                lastWasSpace = false;
            }
        }
        
        // Trim trailing space
        if (resultLength > 0 && result[resultLength - 1] == 0x20) {
            resultLength--;
        }
        
        // Create correctly sized result
        bytes memory trimmed = new bytes(resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            trimmed[i] = result[i];
        }
        
        return string(trimmed);
    }
    
    /**
     * @dev Get properties owned by an address
     */
    function getOwnerProperties(address ownerAddr) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return ownerProperties[ownerAddr];
    }
    
    /**
     * @dev Check if user can list properties
     */
    function canUserListProperties(address user) 
        external 
        view 
        returns (bool) 
    {
        return kycVerifier.canListProperties(user);
    }
    
    /**
     * @dev Update verification oracle (only owner)
     */
    function setVerificationOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address oldOracle = verificationOracle;
        verificationOracle = newOracle;
        emit OracleUpdated(oldOracle, newOracle);
    }
    
    /**
     * @dev Admin function to clear property hashes (for legitimate re-listing)
     */
    function clearPropertyHashes(uint256 propertyId) external onlyOwner {
        Property storage property = properties[propertyId];
        require(!property.isActive, "Cannot clear active property hashes");
        
        delete documentHashToProperty[property.documentHash];
        delete locationHashToProperty[property.locationHash];
    }
    
    /**
     * @dev Check if property is pending approval
     */
    function isPendingApproval(uint256 propertyId) external view returns (bool) {
        return pendingApproval[propertyId];
    }
}
