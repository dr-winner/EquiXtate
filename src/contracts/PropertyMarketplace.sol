// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PropertyMarketplace
 * @dev Marketplace for buying and selling property tokens
 */
contract PropertyMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // USDC token address
    address public usdcToken;

    // Platform fee
    uint256 public platformFeePercentage = 1; // 1% fee

    // Properties and tokens
    struct Property {
        address tokenAddress;
        bool isListed;
        uint256 pricePerToken; // In USDC (6 decimals)
    }

    // Mapping of property tokens to their details
    mapping(address => Property) public properties;
    address[] public propertyList;

    // Events
    event PropertyListed(address indexed tokenAddress, uint256 pricePerToken);
    event PropertyDelisted(address indexed tokenAddress);
    event TokensPurchased(
        address indexed buyer,
        address indexed tokenAddress,
        uint256 amount,
        uint256 cost
    );
    event TokensSold(
        address indexed seller,
        address indexed tokenAddress,
        uint256 amount,
        uint256 proceeds
    );

    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = _usdcToken;
    }

    /**
     * @dev List a property token on the marketplace
     * @param tokenAddress Address of the property token
     * @param pricePerToken Price per token in USDC
     */
    function listProperty(
        address tokenAddress,
        uint256 pricePerToken
    ) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(pricePerToken > 0, "Price must be greater than zero");

        properties[tokenAddress] = Property({
            tokenAddress: tokenAddress,
            isListed: true,
            pricePerToken: pricePerToken
        });

        // Add to list if not already present
        bool exists = false;
        for (uint i = 0; i < propertyList.length; i++) {
            if (propertyList[i] == tokenAddress) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            propertyList.push(tokenAddress);
        }

        emit PropertyListed(tokenAddress, pricePerToken);
    }

    /**
     * @dev Delist a property token from the marketplace
     * @param tokenAddress Address of the property token
     */
    function delistProperty(address tokenAddress) external onlyOwner {
        require(properties[tokenAddress].isListed, "Property not listed");

        properties[tokenAddress].isListed = false;

        emit PropertyDelisted(tokenAddress);
    }

    /**
     * @dev Buy tokens for a property
     * @param tokenAddress Address of the property token
     * @param amount Amount of tokens to buy
     */
    function buyTokens(
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        Property storage property = properties[tokenAddress];
        require(property.isListed, "Property not listed");

        // Calculate cost in USDC
        uint256 cost = (amount * property.pricePerToken) / 1e18;

        // Calculate platform fee
        uint256 platformFee = (cost * platformFeePercentage) / 100;
        uint256 totalCost = cost + platformFee;

        // Transfer USDC from buyer to contract
        IERC20(usdcToken).safeTransferFrom(
            msg.sender,
            address(this),
            totalCost
        );

        // Transfer platform fee to owner
        IERC20(usdcToken).safeTransfer(owner(), platformFee);

        // Transfer tokens to buyer
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);

        emit TokensPurchased(msg.sender, tokenAddress, amount, cost);
    }

    /**
     * @dev Sell tokens back to the marketplace
     * @param tokenAddress Address of the property token
     * @param amount Amount of tokens to sell
     */
    function sellTokens(
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        Property storage property = properties[tokenAddress];
        require(property.isListed, "Property not listed");

        // Calculate proceeds in USDC
        uint256 proceeds = (amount * property.pricePerToken) / 1e18;

        // Calculate platform fee
        uint256 platformFee = (proceeds * platformFeePercentage) / 100;
        uint256 netProceeds = proceeds - platformFee;

        // Transfer tokens from seller to contract
        IERC20(tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        // Transfer platform fee to owner
        IERC20(usdcToken).safeTransfer(owner(), platformFee);

        // Transfer net proceeds to seller
        IERC20(usdcToken).safeTransfer(msg.sender, netProceeds);

        emit TokensSold(msg.sender, tokenAddress, amount, netProceeds);
    }

    /**
     * @dev Update the price per token for a listed property
     * @param tokenAddress Address of the property token
     * @param newPricePerToken New price per token in USDC
     */
    function updateTokenPrice(
        address tokenAddress,
        uint256 newPricePerToken
    ) external onlyOwner {
        require(properties[tokenAddress].isListed, "Property not listed");
        require(newPricePerToken > 0, "Price must be greater than zero");

        properties[tokenAddress].pricePerToken = newPricePerToken;

        emit PropertyListed(tokenAddress, newPricePerToken);
    }

    /**
     * @dev Update the platform fee percentage
     * @param newFeePercentage New fee percentage (e.g., 1 for 1%)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 10, "Fee too high");

        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Get the number of properties listed on the marketplace
     * @return Number of properties
     */
    function getPropertyCount() external view returns (uint256) {
        return propertyList.length;
    }

    /**
     * @dev Get details for a batch of properties
     * @param start Start index
     * @param count Number of properties to return
     * @return Array of property details
     */
    function getProperties(
        uint256 start,
        uint256 count
    ) external view returns (Property[] memory) {
        require(start < propertyList.length, "Invalid start index");

        uint256 end = start + count;
        if (end > propertyList.length) {
            end = propertyList.length;
        }

        Property[] memory result = new Property[](end - start);

        for (uint i = start; i < end; i++) {
            result[i - start] = properties[propertyList[i]];
        }

        return result;
    }
}
