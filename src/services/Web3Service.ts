
import WalletService from './web3/WalletService';
import PropertyTokenService from './web3/PropertyTokenService';
import GovernanceService from './web3/GovernanceService';
import PropertyService from './web3/PropertyService';
import ContractService from './web3/ContractService';

// Main Web3Service facade
class Web3Service {
  // Wallet-related methods
  public initialize = WalletService.initialize.bind(WalletService);
  public connectWallet = WalletService.connectWallet.bind(WalletService);
  public disconnectWallet = WalletService.disconnectWallet.bind(WalletService);
  public isWalletConnected = WalletService.isWalletConnected.bind(WalletService);
  public getWalletAddress = WalletService.getWalletAddress.bind(WalletService);
  public isWeb3Available = WalletService.isWeb3Available.bind(WalletService);
  public getNetwork = WalletService.getNetwork.bind(WalletService);
  
  // Property token methods
  public getPropertyTokenBalance = PropertyTokenService.getPropertyTokenBalance.bind(PropertyTokenService);
  public buyPropertyTokens = PropertyTokenService.buyPropertyTokens.bind(PropertyTokenService);
  public getAvailableTokens = PropertyTokenService.getAvailableTokens.bind(PropertyTokenService);
  
  // New Property service methods
  public getPropertyDetails = PropertyService.getPropertyDetails.bind(PropertyService);
  public createProperty = PropertyService.createProperty.bind(PropertyService);
  public getUserTokenBalance = PropertyService.getUserTokenBalance.bind(PropertyService);
  public distributeRentalIncome = PropertyService.distributeRentalIncome.bind(PropertyService);
  public claimRentalIncome = PropertyService.claimRentalIncome.bind(PropertyService);
  public createAuction = PropertyService.createAuction.bind(PropertyService);
  public placeBid = PropertyService.placeBid.bind(PropertyService);
  public endAuction = PropertyService.endAuction.bind(PropertyService);
  
  // Governance methods
  public getGovernanceProposals = GovernanceService.getGovernanceProposals.bind(GovernanceService);
  public voteOnProposal = GovernanceService.voteOnProposal.bind(GovernanceService);
  public createProposal = GovernanceService.createProposal.bind(GovernanceService);
  public executeProposal = GovernanceService.executeProposal.bind(GovernanceService);
  public cancelProposal = GovernanceService.cancelProposal.bind(GovernanceService);
}

// Export singleton instance
export default new Web3Service();
