
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from '@/utils/propertyUtils';
import { STABLECOIN_SYMBOL } from '@/types/property';

interface UserStatsProps {
  walletAddress: string;
  totalTokensOwned: number;
  totalHoldingsValue: number;
  rentalIncome: number;
  governanceInfluence: string;
  calculateTokenValue: (tokens: number) => number;
  userAvatarImage: string;
}

const UserStatsOverview: React.FC<UserStatsProps> = ({
  walletAddress,
  totalTokensOwned,
  totalHoldingsValue,
  rentalIncome,
  governanceInfluence,
  calculateTokenValue,
  userAvatarImage
}) => {
  return (
    <div className="w-full md:w-1/3 glassmorphism neon-border-purple p-6 rounded-lg">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-20 h-20 border-2 border-space-neon-purple">
          <AvatarImage src={userAvatarImage} />
          <AvatarFallback className="bg-space-deep-purple text-white text-xl">
            {walletAddress?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-orbitron">Your Profile</h1>
          <p className="text-space-neon-blue font-mono text-sm break-all">
            {walletAddress}
          </p>
          <Badge className="mt-2 bg-space-neon-purple">EquiX Investor</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300">Total EquiX</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-space-neon-green font-orbitron">{totalTokensOwned.toLocaleString()}</p>
            <p className="text-xs text-gray-400">≈ {formatPrice(calculateTokenValue(totalTokensOwned))} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300">Holdings Value</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-amber-400 font-orbitron">{formatPrice(totalHoldingsValue)} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300">Rental Income</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-space-neon-blue font-orbitron">{formatPrice(rentalIncome)} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300">Governance</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-space-neon-purple font-orbitron">{governanceInfluence}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserStatsOverview;
