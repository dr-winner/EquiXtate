import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GovernancePanel } from '@/components/governance';
import { RentalIncomePanel } from '@/components/rental';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, PiggyBank, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Demo property token for testing - replace with actual property selection
const DEMO_PROPERTY_TOKEN = '0x0000000000000000000000000000000000000001';

const GovernancePage = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('governance');
  
  // Example: list of property tokens the user owns
  const userPropertyTokens = [DEMO_PROPERTY_TOKEN];
  
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-space-black to-space-deep-purple flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <div className="glassmorphism rounded-xl p-8 mt-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Please connect your wallet to participate in governance and view your rental income.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-black to-space-deep-purple flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="mt-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Governance & Income</h1>
            <p className="text-gray-400">
              Vote on property decisions and claim your rental income distributions
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger 
                value="governance" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-600"
              >
                <Scale className="w-4 h-4" />
                Governance
              </TabsTrigger>
              <TabsTrigger 
                value="income" 
                className="flex items-center gap-2 data-[state=active]:bg-emerald-600"
              >
                <PiggyBank className="w-4 h-4" />
                Rental Income
              </TabsTrigger>
            </TabsList>

            <TabsContent value="governance" className="space-y-6">
              <GovernancePanel 
                propertyToken={DEMO_PROPERTY_TOKEN} 
                walletAddress={address} 
              />
              
              {/* Governance Info Section */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">How Governance Works</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-purple-400 text-2xl font-bold mb-2">1</div>
                    <h4 className="text-white font-semibold mb-2">Create Proposal</h4>
                    <p className="text-slate-400 text-sm">
                      Token holders with at least 1% voting power can create proposals
                      for property decisions.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-purple-400 text-2xl font-bold mb-2">2</div>
                    <h4 className="text-white font-semibold mb-2">Vote</h4>
                    <p className="text-slate-400 text-sm">
                      After a 1-day delay, voting opens for 7 days. Vote For, Against,
                      or Abstain with your tokens.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-purple-400 text-2xl font-bold mb-2">3</div>
                    <h4 className="text-white font-semibold mb-2">Execute</h4>
                    <p className="text-slate-400 text-sm">
                      If 4% quorum is reached and majority votes For, the proposal
                      can be executed after a 2-day timelock.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="income" className="space-y-6">
              <RentalIncomePanel 
                walletAddress={address}
                propertyToken={DEMO_PROPERTY_TOKEN}
                propertyTokens={userPropertyTokens}
              />
              
              {/* Rental Income Info Section */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">About Rental Distributions</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-2">Pro-Rata Distribution</h4>
                    <p className="text-slate-400 text-sm">
                      Rental income is distributed proportionally based on your token ownership.
                      If you own 5% of tokens, you receive 5% of rental distributions.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-2">Automatic Accrual</h4>
                    <p className="text-slate-400 text-sm">
                      Income automatically accrues to your balance. Claim anytime - 
                      your share is preserved even if you transfer tokens later.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-2">Monthly Distributions</h4>
                    <p className="text-slate-400 text-sm">
                      Property managers deposit rental income monthly after deducting
                      management fees and expenses.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-2">Transparent Tracking</h4>
                    <p className="text-slate-400 text-sm">
                      View complete distribution history, APY estimates, and your
                      total earnings from each property.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GovernancePage;
