// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PropertyToken
 * @dev ERC20 token representing fractional ownership of a property
 */
contract PropertyToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public pricePerToken; // Price in USDC (using 6 decimals)
    uint256 public constant TOKEN_DECIMALS = 18;
    uint256 public constant PROPERTY_TOKENS = 10000 * 10 ** 18; // 10,000 tokens total
    uint256 public constant TOKENS_PER_USDC = 50; // 50 tokens per USDC

    address public propertyManager;
    address public propertyAddress;

    // Token distribution
    uint256 public tokensForSale;
    uint256 public tokensSold;

    // Property details
    string public propertyName;
    string public propertyLocation;
    uint256 public propertyValue;

    // Rental income distribution
    mapping(address => uint256) public rentalIncomeEntitled;
    mapping(address => uint256) public rentalIncomeClaimed;
    uint256 public totalRentalIncome;

    // Events
    event TokensPurchased(address buyer, uint256 amount, uint256 cost);
    event TokensSold(address seller, uint256 amount, uint256 proceeds);
    event RentalIncomeAdded(uint256 amount);
    event RentalIncomeClaimed(address user, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _propertyName,
        string memory _propertyLocation,
        uint256 _propertyValue,
        address _propertyManager
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        propertyName = _propertyName;
        propertyLocation = _propertyLocation;
        propertyValue = _propertyValue;
        propertyManager = _propertyManager;

        // Initialize token distribution
        tokensForSale = PROPERTY_TOKENS;
        pricePerToken = (10 ** 6) / TOKENS_PER_USDC; // Price in USDC (6 decimals)

        // Mint all tokens to the contract initially
        _mint(address(this), PROPERTY_TOKENS);
    }

    /**
     * @dev Purchase property tokens with USDC
     * @param amount Amount of tokens to purchase
     * @param usdcAmount Amount of USDC to spend
     */
    function purchaseTokens(
        uint256 amount,
        uint256 usdcAmount
    ) external nonReentrant {
        require(
            amount <= tokensForSale,
            "Not enough tokens available for sale"
        );

        // Calculate cost in USDC
        uint256 cost = amount / TOKENS_PER_USDC;
        require(usdcAmount >= cost, "Insufficient USDC amount");

        // Transfer USDC from buyer to contract
        // require(IERC20(usdcAddress).transferFrom(msg.sender, address(this), cost), "USDC transfer failed");

        // Transfer tokens to buyer
        require(
            IERC20(address(this)).transfer(msg.sender, amount),
            "Token transfer failed"
        );

        // Update state
        tokensForSale -= amount;
        tokensSold += amount;

        emit TokensPurchased(msg.sender, amount, cost);
    }

    /**
     * @dev Distribute rental income to token holders
     * @param amount Amount of rental income to distribute in USDC
     */
    function distributeRentalIncome(uint256 amount) external onlyOwner {
        totalRentalIncome += amount;

        emit RentalIncomeAdded(amount);
    }

    /**
     * @dev Claim rental income
     */
    function claimRentalIncome() external nonReentrant {
        uint256 userBalance = balanceOf(msg.sender);
        require(userBalance > 0, "No tokens owned");

        uint256 userShare = (userBalance * totalRentalIncome) / totalSupply();
        uint256 claimableAmount = userShare - rentalIncomeClaimed[msg.sender];
        require(claimableAmount > 0, "No rental income to claim");

        rentalIncomeClaimed[msg.sender] += claimableAmount;

        // Transfer USDC to user
        // require(IERC20(usdcAddress).transfer(msg.sender, claimableAmount), "USDC transfer failed");

        emit RentalIncomeClaimed(msg.sender, claimableAmount);
    }

    /**
     * @dev Get unclaimed rental income for a user
     * @param user Address of the user
     * @return Unclaimed rental income in USDC
     */
    function getUnclaimedRentalIncome(
        address user
    ) external view returns (uint256) {
        uint256 userBalance = balanceOf(user);
        if (userBalance == 0) return 0;

        uint256 userShare = (userBalance * totalRentalIncome) / totalSupply();
        return userShare - rentalIncomeClaimed[user];
    }

    /**
     * @dev Update property value
     * @param newValue New property value
     */
    function updatePropertyValue(uint256 newValue) external onlyOwner {
        propertyValue = newValue;
    }
}
