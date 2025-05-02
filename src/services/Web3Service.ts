
import WalletService from './web3/WalletService';
import PropertyTokenService from './web3/PropertyTokenService';
import GovernanceService from './web3/GovernanceService';
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
  
  // Governance methods
  public getGovernanceProposals = GovernanceService.getGovernanceProposals.bind(GovernanceService);
  public voteOnProposal = GovernanceService.voteOnProposal.bind(GovernanceService);
}

// Export singleton instance
export default new Web3Service();
