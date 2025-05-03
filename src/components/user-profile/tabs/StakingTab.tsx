
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from '@/utils/propertyUtils';
import { STABLECOIN_SYMBOL } from '@/types/property';

interface StakingTabProps {
  stakedTokens: number;
  rewardsEarned: number;
  calculateTokenValue: (tokens: number) => number;
}

const StakingTab: React.FC<StakingTabProps> = ({ 
  stakedTokens, 
  rewardsEarned,
  calculateTokenValue 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-space-deep-purple/30 border-space-deep-purple">
        <CardHeader>
          <CardTitle>Staking Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-gray-300">Total Staked EquiX</p>
              <p className="font-orbitron text-space-neon-purple">{stakedTokens.toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-300">Staked Value</p>
              <p className="font-orbitron text-space-neon-purple">
                {formatPrice(calculateTokenValue(stakedTokens))} {STABLECOIN_SYMBOL}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-300">Current APR</p>
              <p className="font-orbitron text-space-neon-green">7.5%</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-300">Rewards Earned</p>
              <p className="font-orbitron text-amber-400">
                {formatPrice(rewardsEarned)} {STABLECOIN_SYMBOL}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-space-deep-purple/30 border-space-deep-purple">
        <CardHeader>
          <CardTitle>Staking Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-space-neon-blue rounded-md text-white hover:bg-opacity-80 transition-all">
                Stake Tokens
              </button>
              <button className="flex-1 px-4 py-3 bg-space-neon-purple rounded-md text-white hover:bg-opacity-80 transition-all">
                Unstake Tokens
              </button>
            </div>
            <button className="w-full px-4 py-3 bg-amber-400 rounded-md text-black font-bold hover:bg-opacity-80 transition-all">
              Claim Rewards ({formatPrice(rewardsEarned)} {STABLECOIN_SYMBOL})
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingTab;
