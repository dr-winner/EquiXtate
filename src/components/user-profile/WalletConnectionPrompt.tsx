
import React from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface WalletConnectionPromptProps {
  connectWallet: () => void;
}

const WalletConnectionPrompt: React.FC<WalletConnectionPromptProps> = ({ connectWallet }) => {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <StarField />
      <Navbar />
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-orbitron mb-6">Connect Your Wallet</h1>
        <p className="text-xl text-gray-300 mb-10 text-center">
          Please connect your wallet to view your profile and manage your investments.
        </p>
        <button 
          onClick={connectWallet} 
          className="px-8 py-3 bg-space-neon-blue rounded-md text-white font-bold hover:bg-opacity-80 transition-all"
        >
          Connect Wallet
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default WalletConnectionPrompt;
