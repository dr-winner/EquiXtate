
import React from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/layout/Section';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from "@/components/ui/button";

interface WalletConnectionPromptProps {
  connectWallet: () => void;
}

const WalletConnectionPrompt: React.FC<WalletConnectionPromptProps> = ({ connectWallet }) => {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <StarField />
      <Navbar />
      <Section spacing="normal">
        <PageContainer>
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-semibold mb-4">Connect Your Wallet</h1>
            <p className="ds-body max-w-2xl text-muted-foreground mb-8">
              Please connect your wallet to view your profile and manage your investments.
            </p>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </div>
        </PageContainer>
      </Section>
      <Footer />
    </div>
  );
};

export default WalletConnectionPrompt;
