// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Equixtate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionModule is Ownable {
    EquiXtate public equiXtate;

    struct Auction {
        string propertyId;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isActive;
        address payable seller;
    }

    mapping(string => Auction) public auctions;

    event AuctionStarted(
        string propertyId,
        uint256 minBid,
        uint256 durationDays
    );
    event NewBid(string propertyId, address bidder, uint256 amount);
    event AuctionEnded(string propertyId, address winner, uint256 winningBid);

    constructor(address initialAddress) Ownable(initialAddress) {
        equiXtate = EquiXtate(initialAddress);
    }

    function startAuction(
        string memory _propertyId,
        uint256 _minBid,
        uint256 _durationDays,
        address payable _seller
    ) external onlyOwner {
        auctions[_propertyId] = Auction({
            propertyId: _propertyId,
            minBid: _minBid,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + (_durationDays * 1 days),
            isActive: true,
            seller: _seller
        });

        emit AuctionStarted(_propertyId, _minBid, _durationDays);
    }

    function placeBid(string memory _propertyId, uint256 _amount) external {
        Auction storage auction = auctions[_propertyId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(
            _amount > auction.highestBid && _amount >= auction.minBid,
            "Bid too low"
        );

        // Refund previous bidder (handled off-chain for now)
        auction.highestBid = _amount;
        auction.highestBidder = msg.sender;

        emit NewBid(_propertyId, msg.sender, _amount);
    }

    function endAuction(string memory _propertyId) external {
        Auction storage auction = auctions[_propertyId];
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        require(auction.isActive, "Auction already ended");

        auction.isActive = false;

        if (auction.highestBid > 0) {
            equiXtate.transferFrom(
                auction.highestBidder,
                auction.seller,
                auction.highestBid
            );
            emit AuctionEnded(
                _propertyId,
                auction.highestBidder,
                auction.highestBid
            );
        }
    }
}
