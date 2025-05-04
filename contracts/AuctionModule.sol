// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Equixtate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AuctionModule is Ownable, ReentrancyGuard {
    EquiXtate public equiXtate;
    uint256 public constant MIN_AUCTION_DURATION = 1 days;
    uint256 public constant MAX_AUCTION_DURATION = 30 days;
    uint256 public constant MIN_BID_INCREMENT = 5; // 5% minimum bid increment

    struct Auction {
        bytes32 propertyId;
        address seller;
        uint256 startingPrice;
        uint256 currentBid;
        address currentBidder;
        uint256 endTime;
        bool isActive;
        bool isFinalized;
    }

    mapping(bytes32 => Auction) public auctions;

    event AuctionCreated(bytes32 indexed propertyId, uint256 startingPrice, uint256 endTime);
    event BidPlaced(bytes32 indexed propertyId, address indexed bidder, uint256 amount);
    event AuctionFinalized(bytes32 indexed propertyId, address winner, uint256 amount);
    event AuctionCancelled(bytes32 indexed propertyId);

    constructor(address initialAddress) {
        require(initialAddress != address(0), "Invalid token address");
        equiXtate = EquiXtate(initialAddress);
        _transferOwnership(initialAddress);
    }

    function createAuction(
        bytes32 propertyId,
        uint256 startingPrice,
        uint256 duration
    ) external onlyOwner {
        require(startingPrice > 0, "Starting price must be > 0");
        require(
            duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION,
            "Invalid duration"
        );
        require(!auctions[propertyId].isActive, "Auction already exists");

        auctions[propertyId] = Auction({
            propertyId: propertyId,
            seller: msg.sender,
            startingPrice: startingPrice,
            currentBid: startingPrice,
            currentBidder: address(0),
            endTime: block.timestamp + duration,
            isActive: true,
            isFinalized: false
        });

        emit AuctionCreated(propertyId, startingPrice, block.timestamp + duration);
    }

    function placeBid(bytes32 propertyId) external payable nonReentrant {
        Auction storage auction = auctions[propertyId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");

        uint256 minBidAmount = auction.currentBid + (auction.currentBid * MIN_BID_INCREMENT / 100);
        require(msg.value >= minBidAmount, "Bid too low");

        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            payable(auction.currentBidder).transfer(auction.currentBid);
        }

        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;

        emit BidPlaced(propertyId, msg.sender, msg.value);
    }

    function finalizeAuction(bytes32 propertyId) external nonReentrant {
        Auction storage auction = auctions[propertyId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.isFinalized, "Auction already finalized");

        auction.isActive = false;
        auction.isFinalized = true;

        if (auction.currentBidder != address(0)) {
            // Transfer funds to seller
            payable(auction.seller).transfer(auction.currentBid);
            emit AuctionFinalized(propertyId, auction.currentBidder, auction.currentBid);
        } else {
            emit AuctionCancelled(propertyId);
        }
    }

    function cancelAuction(bytes32 propertyId) external {
        Auction storage auction = auctions[propertyId];
        require(auction.isActive, "Auction not active");
        require(
            msg.sender == auction.seller || msg.sender == owner(),
            "Not authorized"
        );
        require(auction.currentBidder == address(0), "Bids already placed");

        auction.isActive = false;
        auction.isFinalized = true;

        emit AuctionCancelled(propertyId);
    }

    function getAuction(bytes32 propertyId)
        external
        view
        returns (
            address seller,
            uint256 startingPrice,
            uint256 currentBid,
            address currentBidder,
            uint256 endTime,
            bool isActive,
            bool isFinalized
        )
    {
        Auction storage auction = auctions[propertyId];
        return (
            auction.seller,
            auction.startingPrice,
            auction.currentBid,
            auction.currentBidder,
            auction.endTime,
            auction.isActive,
            auction.isFinalized
        );
    }
}
