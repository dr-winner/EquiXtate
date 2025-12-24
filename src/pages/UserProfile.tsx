
import React from 'react';
import { useAccount } from 'wagmi';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserProperties } from '@/components/marketplace/hooks/useUserProperties';
import { useWalletState } from '@/components/marketplace/hooks/useWalletState';
import { EQUIX_TOKEN_VALUE, STABLECOIN_SYMBOL } from '@/types/property';
import WalletConnectionPrompt from '@/components/user-profile/WalletConnectionPrompt';
import UserStatsOverview from '@/components/user-profile/UserStatsOverview';
import ProfileTabs from '@/components/user-profile/ProfileTabs';
import Section from '@/components/layout/Section';
import PageContainer from '@/components/layout/PageContainer';

const UserProfile = () => {
  const { isConnected, address } = useAccount();
  const { walletConnected, connectWallet } = useWalletState();
  const userProperties = useUserProperties(walletConnected);
  const walletAddress = address || '';

  // Mock data - this would come from API/blockchain in a real implementation
  const userStats = {
    totalTokensOwned: userProperties.reduce((sum, prop) => sum + (prop.userTokenBalance || 0), 0),
    totalHoldingsValue: userProperties.reduce((sum, prop) => sum + ((prop.userTokenBalance || 0) * prop.tokenPrice), 0),
    rentalIncome: 2450.75,
    governanceInfluence: userProperties.length > 0 ? 'Active' : 'None',
    stakedTokens: 12500,
    rewardsEarned: 175.50,
  };

  // Mock transaction history
  const transactionHistory = [
    { date: '2025-04-28', type: 'Purchase', property: 'Lakeview Apartment', tokens: 150, amount: 15.0 },
    { date: '2025-04-15', type: 'Rent Collection', property: 'Downtown Studio', tokens: 0, amount: 125.5 },
    { date: '2025-03-22', type: 'Sale', property: 'Beachfront Villa', tokens: 75, amount: 7.5 },
    { date: '2025-03-10', type: 'Governance Reward', property: 'N/A', tokens: 25, amount: 2.5 }
  ];

  // Mock governance proposals
  const governanceProposals = [
    { id: 1, title: 'Property Renovation Fund', status: 'Active', votingEnds: '2025-05-15', votingPower: 150 },
    { id: 2, title: 'New Property Acquisition', status: 'Active', votingEnds: '2025-05-20', votingPower: 150 }
  ];

  // Calculate token value in USDC
  const calculateTokenValue = (tokens: number): number => tokens * EQUIX_TOKEN_VALUE;

  // User avatar image - using a reliable Unsplash image
  const userAvatarImage = "https://images.unsplash.com/photo-1599566150163-29194dcaad36";

  if (!walletConnected) {
    return <WalletConnectionPrompt connectWallet={connectWallet} />;
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <StarField />
      <Navbar />
      
      <main>
        <Section spacing="normal">
          <PageContainer>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <UserStatsOverview 
                  walletAddress={walletAddress}
                  totalTokensOwned={userStats.totalTokensOwned}
                  totalHoldingsValue={userStats.totalHoldingsValue}
                  rentalIncome={userStats.rentalIncome}
                  governanceInfluence={userStats.governanceInfluence}
                  calculateTokenValue={calculateTokenValue}
                  userAvatarImage={userAvatarImage}
                />
              </div>

              <div className="lg:col-span-8">
                <ProfileTabs 
                  userProperties={userProperties}
                  transactionHistory={transactionHistory}
                  governanceProposals={governanceProposals}
                  stakedTokens={userStats.stakedTokens}
                  rewardsEarned={userStats.rewardsEarned}
                  calculateTokenValue={calculateTokenValue}
                  totalTokensOwned={userStats.totalTokensOwned}
                />
              </div>
            </div>
          </PageContainer>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
