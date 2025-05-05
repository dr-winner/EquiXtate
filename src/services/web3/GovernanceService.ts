
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import ContractService from './ContractService';
import WalletService from './WalletService';

export interface ProposalDetail {
  id: number;
  propertyId: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  startTime: Date;
  endTime: Date;
  executed: boolean;
  canceled: boolean;
  hasVoted?: boolean;
}

class GovernanceService {
  // Get governance proposals
  public async getGovernanceProposals(): Promise<ProposalDetail[]> {
    try {
      const contract = ContractService.getGovernanceContract();
      
      if (!contract) {
        throw new Error("Governance contract not initialized");
      }
      
      // For real implementation, this would fetch all proposal IDs first
      // For simplicity, we'll assume 10 possible proposals and filter out invalid ones
      const proposals: ProposalDetail[] = [];
      const walletAddress = WalletService.getWalletAddress();
      
      for (let i = 0; i < 10; i++) {
        try {
          const result = await contract.getProposalDetails(i);
          
          if (result.title !== "") {
            let hasVoted = false;
            
            if (walletAddress) {
              hasVoted = await contract.hasVoted(i, walletAddress);
            }
            
            proposals.push({
              id: Number(result.id),
              propertyId: Number(result.propertyId),
              title: result.title,
              description: result.description,
              votesFor: Number(ethers.formatUnits(result.votesFor, 18)),
              votesAgainst: Number(ethers.formatUnits(result.votesAgainst, 18)),
              startTime: new Date(Number(result.startTime) * 1000),
              endTime: new Date(Number(result.endTime) * 1000),
              executed: result.executed,
              canceled: result.canceled,
              hasVoted
            });
          }
        } catch (e) {
          // Skip invalid proposals
          break;
        }
      }
      
      return proposals;
    } catch (error) {
      console.error("Error getting governance proposals:", error);
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
      
      // Cast vote
      const tx = await contract.castVote(proposalId, support);
      await tx.wait();
      
      toast({
        title: "Vote Cast Successfully",
        description: `Your vote has been recorded for proposal #${proposalId}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error voting on proposal:", error);
      toast({
        variant: "destructive",
        title: "Voting Failed",
        description: error.message || "Failed to cast your vote",
      });
      return false;
    }
  }
  
  // Create a new governance proposal
  public async createProposal(
    propertyId: number,
    title: string,
    description: string,
    targetContract: string = ethers.ZeroAddress,
    callData: string = "0x"
  ): Promise<number | null> {
    try {
      const contract = ContractService.getGovernanceContract();
      
      if (!contract) {
        throw new Error("Governance contract not initialized");
      }
      
      // Create proposal
      const tx = await contract.createProposal(propertyId, title, description, targetContract, callData);
      const receipt = await tx.wait();
      
      // Extract proposal ID from event
      const event = receipt.logs
        .filter((log: any) => log.fragment && log.fragment.name === 'ProposalCreated')
        .map((log: any) => contract.interface.parseLog(log))
        .find((event: any) => event && event.args);
      
      if (event && event.args) {
        const proposalId = Number(event.args.proposalId);
        
        toast({
          title: "Proposal Created",
          description: `Your proposal "${title}" has been created with ID: ${proposalId}`,
        });
        
        return proposalId;
      }
      
      toast({
        title: "Proposal Created",
        description: `Your proposal "${title}" has been created`,
      });
      
      return null;
    } catch (error: any) {
      console.error("Error creating proposal:", error);
      toast({
        variant: "destructive",
        title: "Proposal Creation Failed",
        description: error.message || "Failed to create proposal",
      });
      return null;
    }
  }
  
  // Execute a proposal
  public async executeProposal(proposalId: number): Promise<boolean> {
    try {
      const contract = ContractService.getGovernanceContract();
      
      if (!contract) {
        throw new Error("Governance contract not initialized");
      }
      
      // Execute proposal
      const tx = await contract.executeProposal(proposalId);
      await tx.wait();
      
      toast({
        title: "Proposal Executed",
        description: `Proposal #${proposalId} has been executed successfully`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error executing proposal:", error);
      toast({
        variant: "destructive",
        title: "Execution Failed",
        description: error.message || "Failed to execute proposal",
      });
      return false;
    }
  }
  
  // Cancel a proposal
  public async cancelProposal(proposalId: number): Promise<boolean> {
    try {
      const contract = ContractService.getGovernanceContract();
      
      if (!contract) {
        throw new Error("Governance contract not initialized");
      }
      
      // Cancel proposal
      const tx = await contract.cancelProposal(proposalId);
      await tx.wait();
      
      toast({
        title: "Proposal Canceled",
        description: `Proposal #${proposalId} has been canceled`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error canceling proposal:", error);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel proposal",
      });
      return false;
    }
  }
}

export default new GovernanceService();
