import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  PropertyGovernanceABI, 
  PROPERTY_GOVERNANCE_ADDRESS,
  ProposalType,
  ProposalState,
  VoteSupport
} from '@/contracts/abi/PropertyGovernance';

const CONTRACT_ADDRESS = PROPERTY_GOVERNANCE_ADDRESS;

export interface Proposal {
  id: number;
  proposer: string;
  propertyToken: string;
  proposalType: ProposalType;
  title: string;
  description: string;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  startTime: bigint;
  endTime: bigint;
  state: ProposalState;
}

// Extended proposal data with executionTime
export interface ProposalData {
  id: bigint;
  proposer: string;
  propertyToken: string;
  proposalType: ProposalType;
  title: string;
  description: string;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  startTime: bigint;
  endTime: bigint;
  executionTime: bigint;
  state: ProposalState;
}

export interface VoteReceipt {
  hasVoted: boolean;
  support: VoteSupport;
  votes: bigint;
}

export interface GovernanceSettings {
  votingDelay: bigint;
  votingPeriod: bigint;
  proposalThreshold: bigint;
  quorumThreshold: bigint;
  executionDelay: bigint;
  gracePeriod: bigint;
}

interface UseGovernanceReturn {
  // Read data
  proposalCount: bigint | undefined;
  registeredTokens: string[] | undefined;
  proposals: ProposalData[];
  
  // Property-specific data (requires propertyToken)
  canPropose: boolean;
  votingPower: bigint | undefined;
  quorum: bigint | undefined;
  propertyProposals: bigint[] | undefined;
  settings: GovernanceSettings | undefined;
  
  // Actions
  createProposal: (
    proposalType: ProposalType,
    title: string,
    description: string,
    calldata?: string
  ) => Promise<void>;
  castVote: (proposalId: bigint, support: number, reason?: string) => Promise<void>;
  queueProposal: (proposalId: bigint) => Promise<void>;
  executeProposal: (proposalId: bigint) => Promise<void>;
  cancelProposal: (proposalId: bigint) => Promise<void>;
  
  // Status
  isLoading: boolean;
  error: Error | null;
  txHash: string | undefined;
  
  // Utilities
  getProposal: (proposalId: number) => Promise<Proposal | null>;
  getVoteReceipt: (proposalId: number, voter: string) => Promise<VoteReceipt | null>;
  refresh: () => void;
}

/**
 * Hook for interacting with PropertyGovernance contract
 */
export function useGovernance(
  walletAddress: string | undefined,
  propertyToken?: string
): UseGovernanceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();
  
  // State for contract data
  const [proposalCount, setProposalCount] = useState<bigint | undefined>();
  const [registeredTokens, setRegisteredTokens] = useState<string[] | undefined>();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [canPropose, setCanPropose] = useState(false);
  const [votingPower, setVotingPower] = useState<bigint | undefined>();
  const [quorum, setQuorum] = useState<bigint | undefined>();
  const [propertyProposals, setPropertyProposals] = useState<bigint[] | undefined>();
  const [settings, setSettings] = useState<GovernanceSettings | undefined>();

  // Get provider for read operations
  const getProvider = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback to public RPC
    return new ethers.JsonRpcProvider('https://rpc.sepolia.org');
  }, []);

  // Get signer for write operations
  const getSigner = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return provider.getSigner();
    }
    throw new Error('No wallet provider available');
  }, []);

  // Fetch all governance data
  const fetchData = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;
    
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, provider);
      
      // Fetch basic data
      const count = await contract.proposalCount().catch(() => 0n);
      setProposalCount(count);
      
      const tokens = await contract.getRegisteredTokens().catch(() => []);
      setRegisteredTokens(tokens);
      
      // Fetch property-specific data if propertyToken is set
      if (propertyToken) {
        const propProposals = await contract.getPropertyProposals(propertyToken).catch(() => []);
        setPropertyProposals(propProposals);
        
        const q = await contract.quorum(propertyToken).catch(() => 0n);
        setQuorum(q);
        
        const settingsData = await contract.propertySettings(propertyToken).catch(() => null);
        if (settingsData) {
          setSettings({
            votingDelay: settingsData[0],
            votingPeriod: settingsData[1],
            proposalThreshold: settingsData[2],
            quorumThreshold: settingsData[3],
            executionDelay: settingsData[4],
            gracePeriod: settingsData[5],
          });
        }
        
        // Fetch user-specific data
        if (walletAddress) {
          const canProp = await contract.canPropose(propertyToken, walletAddress).catch(() => false);
          setCanPropose(canProp);
          
          const power = await contract.getVotingPower(propertyToken, walletAddress).catch(() => 0n);
          setVotingPower(power);
        }
        
        // Fetch proposal details
        const proposalsList: ProposalData[] = [];
        for (const proposalId of propProposals) {
          try {
            const [proposer, propToken, proposalType, title, description, 
                   forVotes, againstVotes, abstainVotes, startTime, endTime, state] = 
              await contract.getProposal(proposalId);
            
            proposalsList.push({
              id: proposalId,
              proposer,
              propertyToken: propToken,
              proposalType: proposalType as ProposalType,
              title,
              description,
              forVotes,
              againstVotes,
              abstainVotes,
              startTime,
              endTime,
              executionTime: 0n, // Would need separate call
              state: state as ProposalState,
            });
          } catch (err) {
            console.error(`Failed to fetch proposal ${proposalId}:`, err);
          }
        }
        setProposals(proposalsList);
      }
    } catch (err) {
      console.error('Failed to fetch governance data:', err);
    }
  }, [getProvider, propertyToken, walletAddress]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create proposal
  const createProposal = useCallback(async (
    proposalType: ProposalType,
    title: string,
    description: string,
    calldata?: string
  ) => {
    if (!propertyToken) {
      throw new Error('Property token is required');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, signer);
      
      const tx = await contract.createProposal(
        propertyToken,
        proposalType,
        title,
        description,
        '', // ipfsHash
        ethers.ZeroAddress, // executionTarget
        calldata || '0x',
        0n // executionValue
      );
      
      setTxHash(tx.hash);
      await tx.wait();
      
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create proposal'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [propertyToken, getSigner, fetchData]);

  // Cast vote
  const castVote = useCallback(async (
    proposalId: bigint, 
    support: number,
    reason?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, signer);
      
      const tx = reason 
        ? await contract.castVoteWithReason(proposalId, support, reason)
        : await contract.castVote(proposalId, support);
      setTxHash(tx.hash);
      await tx.wait();
      
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cast vote'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getSigner, fetchData]);

  // Queue proposal
  const queueProposal = useCallback(async (proposalId: bigint) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, signer);
      
      const tx = await contract.queue(proposalId);
      setTxHash(tx.hash);
      await tx.wait();
      
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to queue proposal'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getSigner, fetchData]);

  // Execute proposal
  const executeProposal = useCallback(async (proposalId: bigint) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, signer);
      
      const tx = await contract.execute(proposalId);
      setTxHash(tx.hash);
      await tx.wait();
      
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to execute proposal'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getSigner, fetchData]);

  // Cancel proposal
  const cancelProposal = useCallback(async (proposalId: bigint) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, signer);
      
      const tx = await contract.cancel(proposalId);
      setTxHash(tx.hash);
      await tx.wait();
      
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel proposal'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getSigner, fetchData]);

  // Get proposal details
  const getProposal = useCallback(async (proposalId: number): Promise<Proposal | null> => {
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, provider);
      
      const [proposer, propToken, proposalType, title, description, 
             forVotes, againstVotes, abstainVotes, startTime, endTime, state] = 
        await contract.getProposal(proposalId);
      
      return {
        id: proposalId,
        proposer,
        propertyToken: propToken,
        proposalType: proposalType as ProposalType,
        title,
        description,
        forVotes,
        againstVotes,
        abstainVotes,
        startTime,
        endTime,
        state: state as ProposalState,
      };
    } catch (err) {
      console.error('Failed to get proposal:', err);
      return null;
    }
  }, [getProvider]);

  // Get vote receipt
  const getVoteReceipt = useCallback(async (
    proposalId: number, 
    voter: string
  ): Promise<VoteReceipt | null> => {
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyGovernanceABI, provider);
      
      const [hasVoted, support, votes] = await contract.getReceipt(proposalId, voter);
      
      return {
        hasVoted,
        support: support as VoteSupport,
        votes,
      };
    } catch (err) {
      console.error('Failed to get vote receipt:', err);
      return null;
    }
  }, [getProvider]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    proposalCount,
    registeredTokens,
    proposals,
    canPropose,
    votingPower,
    quorum,
    propertyProposals,
    settings,
    createProposal,
    castVote,
    queueProposal,
    executeProposal,
    cancelProposal,
    isLoading,
    error,
    txHash,
    getProposal,
    getVoteReceipt,
    refresh,
  };
}
