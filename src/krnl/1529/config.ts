// Import the ABI from the abi.json file
import abi from '../../contracts/abi/propertyMarketplace.json';
import { KRNL_CONFIG } from '@/utils/envConfig';

// Prefer Vite envs via KRNL_CONFIG (falls back to empty strings when missing)
export const CONTRACT_ADDRESS = KRNL_CONFIG.contractAddress || '';
export const ENTRY_ID = KRNL_CONFIG.entryId || '';
export const ACCESS_TOKEN = KRNL_CONFIG.accessToken || '';
export const KERNEL_ID = KRNL_CONFIG.kernelId || '1529';

// Export the contract config
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  abi,
  entryId: ENTRY_ID,
  accessToken: ACCESS_TOKEN,
  kernelId: KERNEL_ID,
};

// Re-export the ABI for convenience
export { abi };