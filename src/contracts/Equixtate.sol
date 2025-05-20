// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract EquiXtate is ERC20, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    constructor() ERC20("EquiXtate", "EquiX") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Securely grant admin role
    }

    function setManager(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid manager address");
        _grantRole(MANAGER_ROLE, account);
    }

    function revokeManager(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MANAGER_ROLE, account);
    }

    function isManager(address account) external view returns (bool) {
        return hasRole(MANAGER_ROLE, account);
    }

    function mint(address to, uint256 amount) external onlyRole(MANAGER_ROLE) {
        _mint(to, amount);
    }

    function burn(
        address from,
        uint256 amount
    ) external onlyRole(MANAGER_ROLE) {
        _burn(from, amount);
    }
}
