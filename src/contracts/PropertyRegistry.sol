// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./KYCVerifier.sol";

/**
 * @title PropertyRegistry
 * @dev Manages property listing and registration on the platform
 * @notice Requires ENHANCED KYC tier for property listing
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
    }
    
    KYCVerifier public kycVerifier;
    
    // Property ID => Property details
    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;
    
    // Owner => Property IDs
    mapping(address => uint256[]) public ownerProperties;
    
    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed owner,
        string name,
        uint256 value
    );
    event PropertyUpdated(uint256 indexed propertyId);
    event PropertyDeactivated(uint256 indexed propertyId);
    
    constructor(address _kycVerifier) Ownable(msg.sender) {
        require(_kycVerifier != address(0), "Invalid KYC verifier");
        kycVerifier = KYCVerifier(_kycVerifier);
    }
    
    /**
     * @dev List a new property (requires ENHANCED KYC tier)
     */
    function listProperty(
        string memory name,
        string memory location,
        uint256 value,
        address tokenAddress
    ) external nonReentrant returns (uint256) {
        // Require ENHANCED KYC tier for property listing
        require(
            kycVerifier.canListProperties(msg.sender),
            "Enhanced KYC verification required to list properties"
        );
        
        require(bytes(name).length > 0, "Property name required");
        require(bytes(location).length > 0, "Property location required");
        require(value > 0, "Property value must be positive");
        
        propertyCount++;
        
        properties[propertyCount] = Property({
            id: propertyCount,
            owner: msg.sender,
            name: name,
            location: location,
            value: value,
            tokenAddress: tokenAddress,
            isActive: true,
            listedAt: block.timestamp
        });
        
        ownerProperties[msg.sender].push(propertyCount);
        
        emit PropertyListed(propertyCount, msg.sender, name, value);
        
        return propertyCount;
    }
    
    /**
     * @dev Update property details (only owner)
     */
    function updateProperty(
        uint256 propertyId,
        string memory name,
        string memory location,
        uint256 value
    ) external {
        Property storage property = properties[propertyId];
        require(property.owner == msg.sender, "Not property owner");
        require(property.isActive, "Property not active");
        
        property.name = name;
        property.location = location;
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
        
        emit PropertyDeactivated(propertyId);
    }
    
    /**
     * @dev Get properties owned by an address
     */
    function getOwnerProperties(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return ownerProperties[owner];
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
}
