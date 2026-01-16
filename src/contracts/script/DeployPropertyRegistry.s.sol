// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PropertyRegistry} from "../PropertyRegistry.sol";

contract DeployPropertyRegistry is Script {
    function run() external {
        // Get addresses from environment
        address kycVerifier = vm.envAddress("KYC_VERIFIER_ADDRESS");
        address verificationOracle = vm.envAddress("ORACLE_ADDRESS");
        
        console.log("=== PropertyRegistry Deployment ===");
        console.log("KYC Verifier:", kycVerifier);
        console.log("Verification Oracle:", verificationOracle);
        
        vm.startBroadcast();
        
        PropertyRegistry registry = new PropertyRegistry(kycVerifier, verificationOracle);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("PropertyRegistry deployed at:", address(registry));
        console.log("");
        console.log("Add to .env.local:");
        console.log("VITE_PROPERTY_REGISTRY_ADDRESS=", address(registry));
        console.log("PROPERTY_REGISTRY_ADDRESS=", address(registry));
    }
}
