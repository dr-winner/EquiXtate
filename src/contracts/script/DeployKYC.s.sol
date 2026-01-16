// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {KYCVerifier} from "../KYCVerifier.sol";

contract DeployKYC is Script {
    function run() external {
        address oracle = vm.envAddress("ORACLE_ADDRESS");
        
        console.log("Deploying KYCVerifier with oracle:", oracle);
        
        vm.startBroadcast();
        KYCVerifier verifier = new KYCVerifier(oracle);
        vm.stopBroadcast();
        
        console.log("KYCVerifier deployed at:", address(verifier));
    }
}
