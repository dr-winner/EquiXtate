/**
 * useKRNLPropertyVerification Hook
 * 
 * Uses @krnl-dev/sdk-react-7702 to execute property verification workflows
 * through the KRNL Protocol with decentralized attestation.
 */

import { useState, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { 
  useKRNL, 
  useNodeConfig,
  type TransactionIntentParams,
  type WorkflowObject
} from '@krnl-dev/sdk-react-7702';
import {
  encodePacked,
  keccak256,
  createPublicClient,
  http
} from 'viem';
import { sepolia } from 'viem/chains';
import { KRNL_CONSTANTS } from '@/lib/krnlConfig';
import PropertyRegistryABI from '@/contracts/abi/propertyRegistry.json';

// Property verification workflow template
const propertyVerificationWorkflow: WorkflowObject = {
  name: "PropertyVerificationWorkflow",
  version: "1.0.0",
  description: "Verify property ownership and documents through KRNL attestation",
  attestor: {
    image: "{{ENV.ATTESTOR_IMAGE}}",
    secrets: ["rpcSepoliaURL", "pimlico-apikey"]
  },
  steps: [
    {
      id: "verify_ownership",
      name: "Verify Property Ownership",
      type: "evm_read",
      config: {
        chain: "sepolia",
        contract: "{{ENV.PROPERTY_REGISTRY}}",
        function: "getProperty",
        args: ["{{PROPERTY_ID}}"]
      }
    },
    {
      id: "check_kyc",
      name: "Check KYC Status",
      type: "evm_read",
      config: {
        chain: "sepolia",
        contract: "{{ENV.KYC_VERIFIER}}",
        function: "isKYCVerified",
        args: ["{{ENV.SENDER_ADDRESS}}"]
      }
    },
    {
      id: "attest_verification",
      name: "Create Attestation",
      type: "attestation",
      config: {
        data: {
          propertyId: "{{PROPERTY_ID}}",
          owner: "{{ENV.SENDER_ADDRESS}}",
          verified: true,
          timestamp: "{{TIMESTAMP}}"
        }
      }
    }
  ],
  output: {
    attestationHash: "{{attest_verification.hash}}",
    propertyData: "{{verify_ownership.result}}",
    kycVerified: "{{check_kyc.result}}"
  }
};

export interface PropertyVerificationResult {
  success: boolean;
  attestationHash?: string;
  propertyData?: any;
  kycVerified?: boolean;
  error?: string;
}

export function useKRNLPropertyVerification() {
  const { wallets } = useWallets();
  const {
    signTransactionIntent,
    executeWorkflowFromTemplate,
    resetSteps,
    error: sdkError,
    statusCode,
    steps,
    currentStep
  } = useKRNL();
  const { getConfig } = useNodeConfig();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PropertyVerificationResult | null>(null);

  // Get the embedded wallet from Privy
  const getEmbeddedWallet = useCallback(() => {
    const embeddedWallet = wallets.find(
      w => w.connectorType === 'embedded' && w.walletClientType === 'privy'
    );
    if (!embeddedWallet?.address) {
      throw new Error('No embedded wallet found. Please connect with Privy.');
    }
    return embeddedWallet;
  }, [wallets]);

  // Get nonce from PropertyRegistry contract
  const getContractNonce = async (walletAddress: string): Promise<bigint> => {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(KRNL_CONSTANTS.RPC_URL)
    });

    try {
      const nonce = await client.readContract({
        address: KRNL_CONSTANTS.PROPERTY_REGISTRY as `0x${string}`,
        abi: PropertyRegistryABI,
        functionName: 'nonces',
        args: [walletAddress]
      }) as bigint;
      return nonce;
    } catch {
      // Fallback to 0 if contract doesn't have nonces
      return 0n;
    }
  };

  // Create transaction intent for KRNL
  const createTransactionIntent = (
    walletAddress: string,
    nonce: bigint,
    nodeAddress: string
  ): TransactionIntentParams => {
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    const intentId = keccak256(encodePacked(
      ['address', 'uint256', 'uint256'],
      [walletAddress as `0x${string}`, nonce, BigInt(deadline)]
    )) as `0x${string}`;

    return {
      target: KRNL_CONSTANTS.PROPERTY_REGISTRY as `0x${string}`,
      value: 0n,
      id: intentId,
      nodeAddress: nodeAddress as `0x${string}`,
      delegate: KRNL_CONSTANTS.DELEGATE_OWNER as `0x${string}`,
      targetFunction: '0x00000000' as `0x${string}`, // Placeholder for read-only
      nonce,
      deadline: BigInt(deadline)
    };
  };

  // Execute property verification workflow
  const verifyProperty = useCallback(async (propertyId: string): Promise<PropertyVerificationResult> => {
    setIsLoading(true);
    setError(null);
    resetSteps();

    try {
      const embeddedWallet = getEmbeddedWallet();
      await embeddedWallet.switchChain?.(KRNL_CONSTANTS.CHAIN_ID);

      // Get KRNL node config
      const nodeConfig = await getConfig();
      if (!nodeConfig.workflow.node_address) {
        throw new Error('KRNL node address not available');
      }

      // Get nonce and create transaction intent
      const nonce = await getContractNonce(embeddedWallet.address);
      const transactionIntent = createTransactionIntent(
        embeddedWallet.address,
        nonce,
        nodeConfig.workflow.node_address
      );

      // Sign the transaction intent
      const signature = await signTransactionIntent(transactionIntent);

      // Create template replacements
      const replacements: Record<string, string> = {
        '{{ENV.SENDER_ADDRESS}}': embeddedWallet.address,
        '{{ENV.ATTESTOR_IMAGE}}': KRNL_CONSTANTS.ATTESTOR_IMAGE,
        '{{ENV.PROPERTY_REGISTRY}}': KRNL_CONSTANTS.PROPERTY_REGISTRY,
        '{{ENV.KYC_VERIFIER}}': KRNL_CONSTANTS.KYC_VERIFIER,
        '{{PROPERTY_ID}}': propertyId,
        '{{TIMESTAMP}}': Date.now().toString(),
        '{{USER_SIGNATURE}}': signature,
        '{{TRANSACTION_INTENT_ID}}': transactionIntent.id,
        '{{TRANSACTION_INTENT_DELEGATE}}': transactionIntent.delegate,
        '{{TRANSACTION_INTENT_DEADLINE}}': transactionIntent.deadline.toString(),
      };

      // Execute the workflow
      const workflowResult = await executeWorkflowFromTemplate(
        propertyVerificationWorkflow,
        replacements
      );

      const verificationResult: PropertyVerificationResult = {
        success: true,
        attestationHash: workflowResult?.attestationHash,
        propertyData: workflowResult?.propertyData,
        kycVerified: workflowResult?.kycVerified
      };

      setResult(verificationResult);
      return verificationResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      
      const failedResult: PropertyVerificationResult = {
        success: false,
        error: errorMessage
      };
      setResult(failedResult);
      return failedResult;
    } finally {
      setIsLoading(false);
    }
  }, [getEmbeddedWallet, getConfig, signTransactionIntent, executeWorkflowFromTemplate, resetSteps]);

  return {
    verifyProperty,
    isLoading,
    error: error || sdkError,
    result,
    statusCode,
    steps,
    currentStep,
    resetSteps
  };
}

export default useKRNLPropertyVerification;
