
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
    <div className="glassmorphism p-6 rounded-lg">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16 ring-2 ring-primary/20">
          <AvatarImage src={userAvatarImage} />
          <AvatarFallback className="bg-muted text-foreground text-lg">
            {walletAddress?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">Your Profile</h1>
          <p className="ds-body-sm text-muted-foreground break-all">
            {walletAddress}
          </p>
          <Badge variant="secondary" className="mt-2">EquiX Investor</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <Card className="glassmorphism">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">Total EquiX</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold">{totalTokensOwned.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">≈ {formatPrice(calculateTokenValue(totalTokensOwned))} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">Holdings Value</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold">{formatPrice(totalHoldingsValue)} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">Rental Income</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold">{formatPrice(rentalIncome)} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">Governance</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold">{governanceInfluence}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserStatsOverview;
