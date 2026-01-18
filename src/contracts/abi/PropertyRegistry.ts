// PropertyRegistry ABI - Auto-generated from Solidity contract
// Contract Address (Sepolia): 0xE11D19503029Ed7D059A0022288FB88d61C7c3b4

export const PROPERTY_REGISTRY_ADDRESS = "0xE11D19503029Ed7D059A0022288FB88d61C7c3b4";

export const PropertyRegistryABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "propertyId", "type": "uint256" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": false, "name": "name", "type": "string" },
      { "indexed": false, "name": "value", "type": "uint256" },
      { "indexed": false, "name": "documentHash", "type": "bytes32" }
    ],
    "name": "PropertyListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "propertyId", "type": "uint256" }
    ],
    "name": "PropertyUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "propertyId", "type": "uint256" }
    ],
    "name": "PropertyDeactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "propertyId", "type": "uint256" },
      { "indexed": false, "name": "verificationId", "type": "string" }
    ],
    "name": "PropertyVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "oldOracle", "type": "address" },
      { "indexed": true, "name": "newOracle", "type": "address" }
    ],
    "name": "OracleUpdated",
    "type": "event"
  },
  
  // Read Functions
  {
    "inputs": [],
    "name": "kycVerifier",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verificationOracle",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "propertyCount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "propertyId", "type": "uint256" }],
    "name": "properties",
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "owner", "type": "address" },
      { "name": "name", "type": "string" },
      { "name": "location", "type": "string" },
      { "name": "value", "type": "uint256" },
      { "name": "tokenAddress", "type": "address" },
      { "name": "isActive", "type": "bool" },
      { "name": "listedAt", "type": "uint256" },
      { "name": "documentHash", "type": "bytes32" },
      { "name": "locationHash", "type": "bytes32" },
      { "name": "verificationId", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "ownerAddr", "type": "address" }],
    "name": "getOwnerProperties",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "canUserListProperties",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "documentHash", "type": "bytes32" }],
    "name": "propertyExistsByDocument",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "location", "type": "string" }],
    "name": "propertyExistsByLocation",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "documentHash", "type": "bytes32" }],
    "name": "getPropertyByDocument",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "owner", "type": "address" },
          { "name": "name", "type": "string" },
          { "name": "location", "type": "string" },
          { "name": "value", "type": "uint256" },
          { "name": "tokenAddress", "type": "address" },
          { "name": "isActive", "type": "bool" },
          { "name": "listedAt", "type": "uint256" },
          { "name": "documentHash", "type": "bytes32" },
          { "name": "locationHash", "type": "bytes32" },
          { "name": "verificationId", "type": "string" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "propertyId", "type": "uint256" }],
    "name": "isPendingApproval",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "documentHash", "type": "bytes32" }],
    "name": "documentHashToProperty",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "locationHash", "type": "bytes32" }],
    "name": "locationHashToProperty",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Write Functions
  {
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "location", "type": "string" },
      { "name": "value", "type": "uint256" },
      { "name": "documentHash", "type": "bytes32" }
    ],
    "name": "submitProperty",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "propertyId", "type": "uint256" },
      { "name": "verificationId", "type": "string" },
      { "name": "tokenAddress", "type": "address" }
    ],
    "name": "approveProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "propertyId", "type": "uint256" }],
    "name": "rejectProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "propertyId", "type": "uint256" },
      { "name": "name", "type": "string" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "updateProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "propertyId", "type": "uint256" }],
    "name": "deactivateProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "newOracle", "type": "address" }],
    "name": "setVerificationOracle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "propertyId", "type": "uint256" }],
    "name": "clearPropertyHashes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Legacy function
  {
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "location", "type": "string" },
      { "name": "value", "type": "uint256" },
      { "name": "tokenAddress", "type": "address" }
    ],
    "name": "listProperty",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default PropertyRegistryABI;
