
import { toast } from "@/components/ui/use-toast";
import ContractService from './ContractService';
import WalletService from './WalletService';
import { GovernanceProposal } from './types';
import { parseWeb3Error } from '@/utils/web3Errors';
import { logger } from '@/utils/logger';

class GovernanceService {
  // Get governance proposals
  public async getGovernanceProposals(): Promise<GovernanceProposal[]> {
    try {
      const contract = ContractService.getGovernanceContract();
      
      if (!contract) {
        throw new Error("Governance contract not initialized");
      }
      
      const proposals = await contract.getProposals();
      logger.debug('Fetched governance proposals', { count: proposals.length });
      return proposals.map((proposal: any) => ({
        id: Number(proposal[0]),
        description: proposal[1],
        target: proposal[2],
        callData: proposal[3],
        votesFor: Number(proposal[4]),
        votesAgainst: Number(proposal[5]),
        executed: proposal[6]
      }));
    } catch (error) {
      logger.error("Error getting governance proposals", error);
      return [];
    }
  }
  
  // Vote on a governance proposal
  public async voteOnProposal(proposalId: number, support: boolean): Promise<boolean> {
    try {
      const contract = ContractService.getGovernanceContract();
      
      if (!contract || !WalletService.getSigner()) {
        throw new Error("Governance contract not initialized or wallet not connected");
      }
      
      toast({
        title: "Transaction Pending",
        description: `Submitting your vote on proposal #${proposalId}...`,
      });
      
      const tx = await contract.castVote(proposalId, support);
      await tx.wait();
      
      toast({
        title: "Vote Cast Successfully",
        description: `Your vote has been recorded for proposal #${proposalId}`,
      });
      
      logger.info('Governance vote cast', { proposalId, support });
      return true;
    } catch (error: any) {
      const parsed = parseWeb3Error(error);
      logger.error("Error voting on proposal", error, { proposalId });
      
      toast({
        variant: "destructive",
        title: parsed.title,
        description: parsed.message,
      });
      return false;
    }
  }
}

export default new GovernanceService();
