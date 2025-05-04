// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Equixtate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyManager is Ownable {
    EquiXtate public equiXtate;
    uint256 public constant COOLDOWN_PERIOD = 1 days;

    struct Property {
        string id;
        string location;
        string propertyType;
        uint256 valuationUSD;
        uint256 tokenSupply;
        uint256 registeredAt;
        bool exists;
    }

    // Registered property by unique ID
    mapping(string => Property) public properties;

    // To check duplicates using a hash of location + type + valuation
    mapping(bytes32 => bool) private propertyHashExists;

    // Address cooldowns for property registration
    mapping(address => uint256) public lastRegistrationTime;

    event PropertyRegistered(
        string indexed id,
        string location,
        string propertyType,
        uint256 valuationUSD,
        uint256 tokenSupply,
        uint256 timestamp
    );

    constructor(address initialAddress) {
        require(initialAddress != address(0), "Invalid token address");
        equiXtate = EquiXtate(initialAddress);
        _transferOwnership(initialAddress);
    }

    function registerProperty(
        string memory propertyId,
        string memory location,
        string memory propertyType,
        uint256 valuationUSD
    ) external onlyOwner {
        require(bytes(propertyId).length > 0, "Property ID required");
        require(!properties[propertyId].exists, "Property ID already registered");
        require(valuationUSD > 0, "Valuation must be > 0");

        // Enforce registration cooldown
        require(
            block.timestamp > lastRegistrationTime[msg.sender] + COOLDOWN_PERIOD,
            "Cooldown: wait before registering again"
        );

        // Compute hash of identifying details for uniqueness check
        bytes32 propertyHash = keccak256(abi.encodePacked(location, propertyType, valuationUSD));
        require(!propertyHashExists[propertyHash], "Duplicate property already exists");

        uint256 tokensToMint = valuationUSD; // 1 EXT = $1

        // Register property
        properties[propertyId] = Property({
            id: propertyId,
            location: location,
            propertyType: propertyType,
            valuationUSD: valuationUSD,
            tokenSupply: tokensToMint,
            registeredAt: block.timestamp,
            exists: true
        });

        // Mark this hash as used to prevent duplicates
        propertyHashExists[propertyHash] = true;

        // Update cooldown timestamp
        lastRegistrationTime[msg.sender] = block.timestamp;

        // Mint RET tokens for the property to the platform/owner
        equiXtate.mint(owner(), tokensToMint);

        emit PropertyRegistered(
            propertyId,
            location,
            propertyType,
            valuationUSD,
            tokensToMint,
            block.timestamp
        );
    }
}
