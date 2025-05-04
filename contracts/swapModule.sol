// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Equixtate.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SwapModule is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for EquiXtate;

    IERC20 public sonicToken;
    EquiXtate public equiXtate;

    uint256 public swapRate = 1e18;
    uint256 public constant MAX_SWAP_RATE = 2e18;
    uint256 public constant MAX_WITHDRAWAL = 10_000e18;
    uint256 public lastWithdrawalTime;
    uint256 public constant WITHDRAW_COOLDOWN = 6 hours;

    bool public isPaused = false;

    event Swapped(address indexed user, string direction, uint256 amount);
    event SwapRateUpdated(uint256 newRate);
    event TokensWithdrawn(address token, uint256 amount);
    event Paused();
    event Unpaused();

    modifier notPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    constructor(address _sonicToken, address _equiXtate) {
        require(_sonicToken != address(0) && _equiXtate != address(0), "Zero address");
        sonicToken = IERC20(_sonicToken);
        equiXtate = EquiXtate(_equiXtate);
        _transferOwnership(msg.sender);
    }

    function swapSonicForETX(uint256 _sonicAmount) external nonReentrant notPaused {
        require(_sonicAmount > 0, "Zero amount");
        uint256 etxAmount = (_sonicAmount * swapRate) / 1e18;
        require(equiXtate.balanceOf(address(this)) >= etxAmount, "Not enough EXT");

        sonicToken.safeTransferFrom(msg.sender, address(this), _sonicAmount);
        equiXtate.safeTransfer(msg.sender, etxAmount);

        emit Swapped(msg.sender, "SonicToEXT", _sonicAmount);
    }

    function swapEXTForSonic(uint256 _etxAmount) external nonReentrant notPaused {
        require(_etxAmount > 0, "Zero amount");
        uint256 sonicAmount = (_etxAmount * 1e18) / swapRate;
        require(sonicToken.balanceOf(address(this)) >= sonicAmount, "Not enough Sonic");

        equiXtate.safeTransferFrom(msg.sender, address(this), _etxAmount);
        sonicToken.safeTransfer(msg.sender, sonicAmount);

        emit Swapped(msg.sender, "EXTToSonic", _etxAmount);
    }

    function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(!isPaused, "Withdrawals paused");
        require(amount <= MAX_WITHDRAWAL, "Exceeds max withdrawal");
        require(block.timestamp >= lastWithdrawalTime + WITHDRAW_COOLDOWN, "Cooldown not passed");

        IERC20(tokenAddress).safeTransfer(owner(), amount);
        lastWithdrawalTime = block.timestamp;

        emit TokensWithdrawn(tokenAddress, amount);
    }

    function setSwapRate(uint256 _rate) external onlyOwner {
        require(_rate > 0 && _rate <= MAX_SWAP_RATE, "Invalid swap rate");
        swapRate = _rate;
        emit SwapRateUpdated(_rate);
    }

    function pauseContract() external onlyOwner {
        isPaused = true;
        emit Paused();
    }

    function unpauseContract() external onlyOwner {
        isPaused = false;
        emit Unpaused();
    }
}
