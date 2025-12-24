/**
 * Web3 Error Parsing Utility
 * 
 * Provides standardized error handling for Web3/Ethereum interactions.
 * Parses common Web3 errors and returns user-friendly messages.
 */

interface Web3Error extends Error {
  code?: string | number;
  reason?: string;
  data?: any;
}

/**
 * Parse Web3 errors into user-friendly messages
 */
export function parseWeb3Error(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  const err = error as Web3Error;

  // User rejected transaction
  if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user';
  }

  // Insufficient funds
  if (err.code === -32000 || err.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }

  // Network errors
  if (err.code === 'NETWORK_ERROR' || err.message?.includes('network')) {
    return 'Network error. Please check your connection';
  }

  // Contract execution reverted
  if (err.message?.includes('execution reverted')) {
    const reason = err.reason || 'Contract execution failed';
    return reason;
  }

  // Gas estimation failed
  if (err.message?.includes('gas required exceeds')) {
    return 'Transaction would fail. Insufficient gas or contract error';
  }

  // Nonce too low
  if (err.message?.includes('nonce too low')) {
    return 'Transaction nonce error. Please try again';
  }

  // Replacement transaction underpriced
  if (err.message?.includes('replacement transaction underpriced')) {
    return 'Transaction already pending. Please wait or increase gas price';
  }

  // Timeout
  if (err.message?.includes('timeout')) {
    return 'Transaction timeout. Please try again';
  }

  // MetaMask/wallet not found
  if (err.message?.includes('provider') || err.message?.includes('ethereum')) {
    return 'Wallet not detected. Please install MetaMask';
  }

  // Generic fallback
  if (err.message) {
    // Truncate long error messages
    const msg = err.message;
    return msg.length > 100 ? `${msg.substring(0, 100)}...` : msg;
  }

  return 'An error occurred during the transaction';
}

/**
 * Check if error is a user rejection
 */
export function isUserRejection(error: unknown): boolean {
  const err = error as Web3Error;
  return err.code === 4001 || err.code === 'ACTION_REJECTED';
}

/**
 * Check if error is network related
 */
export function isNetworkError(error: unknown): boolean {
  const err = error as Web3Error;
  return err.code === 'NETWORK_ERROR' || err.message?.includes('network') || false;
}

/**
 * Check if error is insufficient funds
 */
export function isInsufficientFunds(error: unknown): boolean {
  const err = error as Web3Error;
  return err.code === -32000 || err.message?.includes('insufficient funds') || false;
}
