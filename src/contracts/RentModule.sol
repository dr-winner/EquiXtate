// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Equixtate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RentModule is Ownable {
    EquiXtate public equiXtate;

    struct RentInfo {
        string propertyId; // for frontend traceability
        address tenant;
        uint256 rentAmount; // in RET tokens
        uint256 rentDueDate;
        bool isPaid;
    }

    mapping(bytes32 => RentInfo[]) public rentLedger;

    event RentSet(
        string propertyId,
        address tenant,
        uint256 rentAmount,
        uint256 rentDueDate
    );
    event RentPaid(string propertyId, address tenant, uint256 rentAmount);

    constructor(address initialAddress) Ownable(initialAddress) {
        require(initialAddress != address(0), "Invalid token address");
        equiXtate = EquiXtate(initialAddress);
    }

    function _hashPropertyId(
        string memory _propertyId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_propertyId));
    }

    function setRent(
        string memory _propertyId,
        address _tenant,
        uint256 _rentAmount,
        uint256 _daysToDue
    ) external onlyOwner {
        require(_tenant != address(0), "Invalid tenant");
        require(_rentAmount > 0, "Rent must be > 0");
        require(_daysToDue > 0, "Duration must be > 0");

        uint256 dueDate = block.timestamp + (_daysToDue * 1 days);
        bytes32 idHash = _hashPropertyId(_propertyId);

        rentLedger[idHash].push(
            RentInfo({
                propertyId: _propertyId,
                tenant: _tenant,
                rentAmount: _rentAmount,
                rentDueDate: dueDate,
                isPaid: false
            })
        );

        emit RentSet(_propertyId, _tenant, _rentAmount, dueDate);
    }

    function payRent(string memory _propertyId, uint256 index) external {
        bytes32 idHash = _hashPropertyId(_propertyId);
        require(index < rentLedger[idHash].length, "Invalid index");

        RentInfo storage rent = rentLedger[idHash][index];

        require(msg.sender == rent.tenant, "Not the tenant");
        require(!rent.isPaid, "Already paid");
        require(block.timestamp <= rent.rentDueDate, "Rent is overdue");

        bool success = equiXtate.transferFrom(
            msg.sender,
            owner(),
            rent.rentAmount
        );
        require(success, "Transfer failed");

        rent.isPaid = true;

        emit RentPaid(_propertyId, msg.sender, rent.rentAmount);
    }
}
