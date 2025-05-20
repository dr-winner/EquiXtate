// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Equixtate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BuyModule is Ownable, ReentrancyGuard {
    EquiXtate public equiXtate;
    uint256 public constant MAX_ID_BYTES = 64;
    uint256 public constant MIN_EXPIRY_DURATION = 1 hours;
    uint256 public constant MAX_EXPIRY_DURATION = 30 days;

    struct PropertySale {
        bytes32 propertyId; // More efficient and secure
        string originalIdString; // For frontend traceability
        address seller;
        address buyer;
        uint256 price; // in RET
        bool isSold;
        uint256 expiresAt; // Timestamp
    }

    mapping(bytes32 => PropertySale) public sales;

    event PropertyListedForSale(
        bytes32 indexed propertyId,
        string originalId,
        uint256 price,
        address seller,
        uint256 expiresAt
    );
    event PropertyBought(
        bytes32 indexed propertyId,
        address buyer,
        uint256 price
    );
    event PropertyListingExpired(bytes32 indexed propertyId);

    constructor(address initialAddress) Ownable(initialAddress) {
        require(initialAddress != address(0), "Invalid token address");
        equiXtate = EquiXtate(initialAddress);
    }

    /// @dev Internal helper to hash and validate property IDs
    function _hashPropertyId(
        string memory _inputId
    ) internal pure returns (bytes32) {
        bytes memory idBytes = bytes(_inputId);
        require(
            idBytes.length > 0 && idBytes.length <= MAX_ID_BYTES,
            "Invalid ID length"
        );
        return keccak256(abi.encodePacked(_inputId));
    }

    /// @notice Lists a property for sale
    function listPropertyForSale(
        string memory _idString,
        uint256 _price,
        address _seller,
        uint256 _duration
    ) external onlyOwner {
        require(bytes(_idString).length > 0, "Empty ID");
        require(_price > 0, "Price must be > 0");
        require(_seller != address(0), "Invalid seller");
        require(
            _duration >= MIN_EXPIRY_DURATION &&
                _duration <= MAX_EXPIRY_DURATION,
            "Invalid expiry duration"
        );

        bytes32 idHash = _hashPropertyId(_idString);
        PropertySale storage existing = sales[idHash];
        require(
            !existing.isSold && existing.expiresAt < block.timestamp,
            "Property active or sold"
        );

        sales[idHash] = PropertySale({
            propertyId: idHash,
            originalIdString: _idString,
            seller: _seller,
            buyer: address(0),
            price: _price,
            isSold: false,
            expiresAt: block.timestamp + _duration
        });

        emit PropertyListedForSale(
            idHash,
            _idString,
            _price,
            _seller,
            block.timestamp + _duration
        );
    }

    /// @notice Allows users to buy a listed property
    function buyProperty(string memory _idString) external nonReentrant {
        bytes32 id = _hashPropertyId(_idString);
        PropertySale storage sale = sales[id];

        require(!sale.isSold, "Already sold");
        require(block.timestamp < sale.expiresAt, "Listing expired");

        bool success = equiXtate.transferFrom(
            msg.sender,
            sale.seller,
            sale.price
        );
        require(success, "Token transfer failed");

        sale.buyer = msg.sender;
        sale.isSold = true;

        emit PropertyBought(id, msg.sender, sale.price);
    }

    /// @notice Manually marks expired listings to prevent abuse
    function markExpired(string memory _idString) external {
        bytes32 id = _hashPropertyId(_idString);
        PropertySale storage sale = sales[id];

        require(!sale.isSold, "Already sold");
        require(block.timestamp >= sale.expiresAt, "Not expired");
        require(
            msg.sender == sale.seller || msg.sender == owner(),
            "Only seller or owner can expire"
        );

        sale.isSold = true; // Marks it as expired
        emit PropertyListingExpired(id);
    }
}
