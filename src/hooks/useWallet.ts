/**
 * Web3 Hooks using Wagmi
 * 
 * Modern Web3 integration using wagmi hooks for wallet connection,
 * contract interactions, and blockchain state management.
 */

import { useAccount, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useEffect } from 'react';
import { logger } from '@/utils/logger';

/**
 * Main hook for wallet connection state
 */
export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  
  // Get ETH balance
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
  });

  useEffect(() => {
    if (isConnected && address) {
      logger.wallet('Connected', address, { chain: chain?.name });
    }
  }, [isConnected, address, chain]);

  return {
    // Connection state
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Chain info
    chainId,
    chain,
    chains,
    switchChain,
    
    // Balance
    balance: balance?.value,
    balanceFormatted: balance?.formatted,
    balanceSymbol: balance?.symbol,
    refetchBalance,
    
    // Actions
    disconnect,
  };
}

/**
 * Hook for checking if wallet is connected
 */
export function useIsWalletConnected() {
  const { isConnected } = useAccount();
  return isConnected;
}

/**
 * Hook for getting current wallet address
 */
export function useWalletAddress() {
  const { address } = useAccount();
  return address;
}

/**
 * Hook for getting current chain
 */
export function useCurrentChain() {
  const { chain } = useAccount();
  return chain;
}
