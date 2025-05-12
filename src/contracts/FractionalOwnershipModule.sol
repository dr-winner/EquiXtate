// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Equixtate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FractionalOwnershipModule is Ownable {
    EquiXtate public equiXtate;

    struct Property {
        string propertyId;
        uint256 valuation;
        address owner;
        uint256 totalSupply;
        bool exists;
    }

    mapping(bytes32 => Property) private properties;

    event PropertyListed(
        string indexed propertyId,
        uint256 valuation,
        address indexed owner
    );
    event FractionalTokensPurchased(
        string indexed propertyId,
        uint256 amount,
        address indexed buyer
    );

    constructor(address equixtate) Ownable(msg.sender) {
        require(equixtate != address(0), "Invalid token contract");
        equiXtate = EquiXtate(equixtate);
    }

    function _validateId(
        string memory _propertyId
    ) internal pure returns (bytes32) {
        bytes memory idBytes = bytes(_propertyId);
        require(
            idBytes.length > 0 && idBytes.length <= 64,
            "Invalid property ID length"
        );
        return keccak256(abi.encodePacked(_propertyId));
    }

    function listProperty(
        string memory _propertyId,
        uint256 _valuation,
        address _propertyOwner
    ) external onlyOwner {
        bytes32 hashedId = _validateId(_propertyId);
        require(!properties[hashedId].exists, "Already listed");
        require(_valuation > 0, "Valuation must be > 0");
        require(_propertyOwner != address(0), "Invalid owner address");

        // Store property
        properties[hashedId] = Property({
            propertyId: _propertyId,
            valuation: _valuation,
            owner: _propertyOwner,
            totalSupply: _valuation,
            exists: true
        });

        // Mint RET to property owner
        equiXtate.mint(_propertyOwner, _valuation);

        emit PropertyListed(_propertyId, _valuation, _propertyOwner);
    }

    function purchaseFraction(
        string memory _propertyId,
        uint256 _amount
    ) external {
        bytes32 hashedId = _validateId(_propertyId);
        require(properties[hashedId].exists, "Not listed");
        require(_amount > 0, "Invalid amount");

        Property storage prop = properties[hashedId];

        // Buyer must get approval from owner
        require(
            equiXtate.allowance(prop.owner, address(this)) >= _amount,
            "Owner has not approved transfer"
        );

        equiXtate.transferFrom(prop.owner, msg.sender, _amount);

        emit FractionalTokensPurchased(_propertyId, _amount, msg.sender);
    }

    function getProperty(
        string memory _propertyId
    )
        external
        view
        returns (
            string memory id,
            uint256 valuation,
            address owner,
            uint256 totalSupply
        )
    {
        bytes32 hashedId = _validateId(_propertyId);
        require(properties[hashedId].exists, "Property does not exist");
        Property memory prop = properties[hashedId];
        return (prop.propertyId, prop.valuation, prop.owner, prop.totalSupply);
    }
}
