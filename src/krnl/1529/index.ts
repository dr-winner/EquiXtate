"use client";

import { ethers } from "krnl-sdk";
import { abi as contractAbi, CONTRACT_ADDRESS, ENTRY_ID, ACCESS_TOKEN } from "./config";
import { AbiCoder } from "ethers";
import { KRNL_CONFIG } from '@/utils/envConfig';

// ==========================================================
// Lazy provider creation using Vite envs
const getKrnlProvider = () => {
  const rpcUrl = KRNL_CONFIG.rpcUrl;
  if (!rpcUrl) {
    throw new Error("KRNL RPC URL not configured (VITE_RPC_KRNL)");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Determine if we're missing critical KRNL config; used to enable mock mode
const isMockMode = () => !KRNL_CONFIG.rpcUrl || !ENTRY_ID || !ACCESS_TOKEN || !CONTRACT_ADDRESS;

// Validate required envs early (but avoid crashing in mock-mode callers)
const assertRequiredConfig = () => {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not found (VITE_CONTRACT_ADDRESS)");
  if (!ENTRY_ID || !ACCESS_TOKEN) throw new Error("KRNL credentials missing (VITE_KRNL_ENTRY_ID / VITE_KRNL_ACCESS_TOKEN)");
};

// ==========================================================
// Encode parameters for kernel 337
const abiCoder = new ethers.AbiCoder();

/**
 * Execute KRNL with the provided address or default to environment variable
 * @param address Optional wallet address to use (from wallet connection)
 * @param customKernelId Optional kernel ID to use
 * @returns KRNL payload result
 */
export async function executeKrnl(address?: string, customKernelId?: string) {
  const kernelId = customKernelId || "337";

  if (isMockMode()) {
    console.warn('[KRNL] Mock mode in executeKrnl (missing env). Returning mock payload.');
    const mockAuth = '0x' + 'mock'.repeat(8).slice(0, 64);
    const mockResponse = abiCoder.encode([
      "address",
      "bool",
      "uint256"
    ], [address || ethers.ZeroAddress, true, 0n]);

    return {
      auth: mockAuth,
      kernel_responses: mockResponse,
      kernel_params: {
        [kernelId]: {
          functionParams: abiCoder.encode(["uint256", "uint256"], [0, 1])
        }
      }
    };
  }

  assertRequiredConfig();
  const krnlProvider = getKrnlProvider();

  // Use provided address or throw error if not available
  const walletAddress = address || '';

  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  // Encode the address parameter
  const parameterForKernel = abiCoder.encode(["uint256", "uint256"], [0, 1]);

  // Create the kernel request data with the correct structure
  const kernelRequestData = {
    senderAddress: walletAddress,
    kernelPayload: {
      [kernelId]: {
        // The KRNL node expects functionParams to be a string, not an array
        // Use type assertion to bypass TypeScript checking
        functionParams: parameterForKernel
      }
    }
  } as any; // Use type assertion to bypass TypeScript type checking

  // Example input for smart contract
  // const textInput = "Example";
  const functionParams = abiCoder.encode(["uint256", "uint256"], [0, 1]);

  // Execute KRNL kernels
  const krnlPayload = await krnlProvider.executeKernels(
    ENTRY_ID,
    ACCESS_TOKEN,
    kernelRequestData,
    functionParams
  );
  const response = krnlPayload.kernel_responses;
  const decodedData = abiCoder.decode(
    ["address", "bool", "uint256"],
    response
  );

  // Create a more readable object
  const propertyStruct = {
    tokenAddress: decodedData[0],
    isListed: decodedData[1],
    pricePerToken: decodedData[2]
  };

  console.log("Krnl payload:", propertyStruct);
  // return propertyStruct;


  return krnlPayload;
}

/**
 * Call the protected function on the contract with KRNL payload
 * @param executeResult The result from executeKrnl
 * @param signer The signer to use for the transaction
 * @returns Transaction hash
 */
// export async function callContractProtectedFunction(executeResult: any, signer?: ethers.Signer) {
//   if (!signer) {
//     throw new Error("Signer is required");
//   }

//   console.log("Execute result:", executeResult);

//   // Create contract instance with the provided signer
//   const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);

//   // Format the payload for the contract
//   const krnlPayload = {
//     auth: executeResult.auth,
//     kernelResponses: executeResult.kernel_responses,
//     kernelParams: executeResult.kernel_params
//   };

//   // Example input for smart contract
//   const textInput = "Example";

//   // Call the protected function
//   const tx = await contract.protectedFunction(krnlPayload, textInput);

//   // Wait for the transaction to be mined
//   await tx.wait();

//   return tx.hash;
// }

export async function getRealEstate(executeResult: any, signer?: ethers.Signer) {
  if (!signer) {
    throw new Error("Signer is required");
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);

  const realEstate = await contract.getProperties(0, 1);

  console.log("Real estate:", realEstate);
  await realEstate.wait();

  return realEstate;
}