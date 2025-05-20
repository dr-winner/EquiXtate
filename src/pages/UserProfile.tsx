
import React, { useState, useEffect } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserProperties } from '@/components/marketplace/hooks/useUserProperties';
import { useWalletState } from '@/components/marketplace/hooks/useWalletState';
import { EQUIX_TOKEN_VALUE, STABLECOIN_SYMBOL } from '@/types/property';
import Web3Service from '@/services/Web3Service';
import WalletConnectionPrompt from '@/components/user-profile/WalletConnectionPrompt';
import UserStatsOverview from '@/components/user-profile/UserStatsOverview';
import ProfileTabs from '@/components/user-profile/ProfileTabs';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import PropertyUploadModal from '@/components/property/PropertyUploadModal';
import { useAuthenticationModal } from '@/hooks/use-authentication-modal';
import { toast } from '@/components/ui/use-toast';

const UserProfile = () => {
  const { walletConnected, connectWallet } = useWalletState();
  const { openModal: openAuthModal } = useAuthenticationModal();
  const userProperties = useUserProperties(walletConnected);
  const walletAddress = Web3Service.getWalletAddress() || '';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

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

  const handlePropertyUpload = () => {
    if (!walletConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to upload properties.",
      });
      return;
    }
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please complete verification to upload properties.",
      });
      openAuthModal();
      return;
    }
    
    setUploadModalOpen(true);
  };

  if (!walletConnected) {
    return <WalletConnectionPrompt connectWallet={connectWallet} />;
  }

  if (walletConnected && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <StarField />
        <Navbar />
        
        <div className="container mx-auto px-4 py-24">
          <div className="glassmorphism neon-border-blue p-8 rounded-lg text-center max-w-lg mx-auto">
            <h1 className="text-2xl font-orbitron mb-4">Identity Verification Required</h1>
            <p className="mb-6 text-gray-300">
              To access your profile and invest in properties, you'll need to complete our KYC verification process.
            </p>
            <Button 
              onClick={() => openAuthModal()}
              className="cosmic-btn py-2 px-6"
            >
              Verify Identity
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <StarField />
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-orbitron">
            <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-blue">
              Investor Dashboard
            </span>
          </h1>
          
          <Button 
            onClick={handlePropertyUpload}
            className="cosmic-btn px-4 py-2 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>List Property</span>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <UserStatsOverview 
            walletAddress={walletAddress}
            totalTokensOwned={userStats.totalTokensOwned}
            totalHoldingsValue={userStats.totalHoldingsValue}
            rentalIncome={userStats.rentalIncome}
            governanceInfluence={userStats.governanceInfluence}
            calculateTokenValue={calculateTokenValue}
            userAvatarImage={userAvatarImage}
          />

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
      </main>
      
      <PropertyUploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          toast({
            title: "Property Submitted",
            description: "Your property has been submitted for verification.",
          });
          setUploadModalOpen(false);
        }}
      />
      
      <Footer />
    </div>
  );
};

export default UserProfile;
