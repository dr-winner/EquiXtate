// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {PropertyGovernance} from "../PropertyGovernance.sol";

contract DeployPropertyGovernance is Script {
    function run() external returns (PropertyGovernance) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        PropertyGovernance governance = new PropertyGovernance();
        
        console.log("PropertyGovernance deployed at:", address(governance));
        
        vm.stopBroadcast();
        
        return governance;
    }
}
