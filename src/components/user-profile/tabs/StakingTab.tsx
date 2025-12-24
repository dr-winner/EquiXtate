
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Staking Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Total Staked EquiX</p>
              <p className="font-semibold">{stakedTokens.toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Staked Value</p>
              <p className="font-semibold">
                {formatPrice(calculateTokenValue(stakedTokens))} {STABLECOIN_SYMBOL}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Current APR</p>
              <p className="font-semibold">7.5%</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Rewards Earned</p>
              <p className="font-semibold">
                {formatPrice(rewardsEarned)} {STABLECOIN_SYMBOL}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Staking Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-3">
              <Button className="flex-1">Stake Tokens</Button>
              <Button variant="secondary" className="flex-1">Unstake Tokens</Button>
            </div>
            <Button className="w-full" variant="secondary">
              Claim Rewards ({formatPrice(rewardsEarned)} {STABLECOIN_SYMBOL})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingTab;
