// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {RentDistribution} from "../RentDistribution.sol";

contract DeployRentDistribution is Script {
    function run() external returns (RentDistribution) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", msg.sender);
        
        vm.startBroadcast(deployerPrivateKey);
        
        RentDistribution rentDist = new RentDistribution(treasury);
        
        console.log("RentDistribution deployed at:", address(rentDist));
        console.log("Treasury set to:", treasury);
        
        vm.stopBroadcast();
        
        return rentDist;
    }
}
