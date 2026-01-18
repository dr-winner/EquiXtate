// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PropertyGovernance} from "../PropertyGovernance.sol";
import {RentDistribution} from "../RentDistribution.sol";

/**
 * @title DeployGovernanceAndRent
 * @notice Deploy both PropertyGovernance and RentDistribution contracts together
 * @dev Run with: forge script script/DeployGovernanceAndRent.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
 */
contract DeployGovernanceAndRent is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", msg.sender);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy PropertyGovernance
        PropertyGovernance governance = new PropertyGovernance();
        console.log("PropertyGovernance deployed at:", address(governance));
        
        // Deploy RentDistribution with treasury address
        RentDistribution rentDist = new RentDistribution(treasury);
        console.log("RentDistribution deployed at:", address(rentDist));
        console.log("Treasury set to:", treasury);
        
        vm.stopBroadcast();
        
        // Output for .env file
        console.log("\n=== Add to .env ===");
        console.log("VITE_PROPERTY_GOVERNANCE_ADDRESS=", address(governance));
        console.log("VITE_RENT_DISTRIBUTION_ADDRESS=", address(rentDist));
    }
}
