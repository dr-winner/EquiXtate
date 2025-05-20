
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCardProps } from '@/components/PropertyCard';
import PropertiesTab from './tabs/PropertiesTab';
import TransactionsTab from './tabs/TransactionsTab';
import GovernanceTab from './tabs/GovernanceTab';
import StakingTab from './tabs/StakingTab';
import AnalyticsTab from './tabs/AnalyticsTab';

interface ProfileTabsProps {
  userProperties: PropertyCardProps[];
  transactionHistory: Array<{
    date: string;
    type: string;
    property: string;
    tokens: number;
    amount: number;
  }>;
  governanceProposals: Array<{
    id: number;
    title: string;
    status: string;
    votingEnds: string;
    votingPower: number;
  }>;
  stakedTokens: number;
  rewardsEarned: number;
  calculateTokenValue: (tokens: number) => number;
  totalTokensOwned: number;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  userProperties,
  transactionHistory,
  governanceProposals,
  stakedTokens,
  rewardsEarned,
  calculateTokenValue,
  totalTokensOwned
}) => {
  return (
    <div className="w-full md:w-2/3 glassmorphism neon-border-green p-6 rounded-lg">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-5 bg-space-deep-purple/40">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties">
          <PropertiesTab userProperties={userProperties} />
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionsTab transactions={transactionHistory} />
        </TabsContent>
        
        <TabsContent value="governance">
          <GovernanceTab proposals={governanceProposals} />
        </TabsContent>
        
        <TabsContent value="staking">
          <StakingTab 
            stakedTokens={stakedTokens} 
            rewardsEarned={rewardsEarned} 
            calculateTokenValue={calculateTokenValue}
          />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsTab 
            stakedTokens={stakedTokens}
            totalTokensOwned={totalTokensOwned}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
