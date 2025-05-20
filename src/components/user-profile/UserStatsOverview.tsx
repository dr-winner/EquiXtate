
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from '@/utils/propertyUtils';
import { STABLECOIN_SYMBOL } from '@/types/property';
import { User, Wallet, History, Settings, HelpCircle, DollarSign, Percent } from 'lucide-react';

interface UserStatsProps {
  walletAddress: string;
  totalTokensOwned: number;
  totalHoldingsValue: number;
  rentalIncome: number;
  governanceInfluence: string;
  calculateTokenValue: (tokens: number) => number;
  userAvatarImage?: string; // Made optional since we're using an emoticon
}

const UserStatsOverview: React.FC<UserStatsProps> = ({
  walletAddress,
  totalTokensOwned,
  totalHoldingsValue,
  rentalIncome,
  governanceInfluence,
  calculateTokenValue
}) => {
  // Create a random color for the avatar background based on wallet address
  const getColorFromAddress = (address: string): string => {
    const hash = address.slice(2, 8);
    return `#${hash}`;
  };

  // Get first two characters from wallet address for avatar
  const avatarInitials = walletAddress ? walletAddress.slice(2, 4).toUpperCase() : '🚀';
  const avatarColor = getColorFromAddress(walletAddress || '0x123456');

  return (
    <div className="w-full md:w-1/3 glassmorphism neon-border-purple p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-space-neon-purple">
          <AvatarFallback className="text-white text-xl" style={{ backgroundColor: avatarColor }}>
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-orbitron">Your Profile</h1>
          <p className="text-space-neon-blue font-mono text-sm break-all">
            {walletAddress}
          </p>
          <Badge className="mt-2 bg-space-neon-purple">EquiX Investor</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-space-neon-blue" />
              Total EquiX
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-space-neon-green font-orbitron">{totalTokensOwned.toLocaleString()}</p>
            <p className="text-xs text-gray-400">≈ {formatPrice(calculateTokenValue(totalTokensOwned))} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-space-neon-green" />
              Holdings Value
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-amber-400 font-orbitron">{formatPrice(totalHoldingsValue)} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <Percent className="h-4 w-4 text-space-neon-blue" />
              Rental Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-space-neon-blue font-orbitron">{formatPrice(rentalIncome)} {STABLECOIN_SYMBOL}</p>
          </CardContent>
        </Card>

        <Card className="bg-space-deep-purple/30 border-space-deep-purple">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4 text-space-neon-purple" />
              Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xl text-space-neon-purple font-orbitron">{governanceInfluence}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        <button className="flex items-center gap-2 bg-space-deep-purple/40 p-2 rounded-lg hover:bg-space-deep-purple/60 transition-all">
          <Settings className="h-4 w-4 text-space-neon-blue" />
          <span className="text-sm">Settings</span>
        </button>
        
        <button className="flex items-center gap-2 bg-space-deep-purple/40 p-2 rounded-lg hover:bg-space-deep-purple/60 transition-all">
          <HelpCircle className="h-4 w-4 text-space-neon-green" />
          <span className="text-sm">Help Center</span>
        </button>
        
        <button className="flex items-center gap-2 bg-space-deep-purple/40 p-2 rounded-lg hover:bg-space-deep-purple/60 transition-all">
          <History className="h-4 w-4 text-space-neon-purple" />
          <span className="text-sm">Transaction History</span>
        </button>
        
        <button className="flex items-center gap-2 bg-space-deep-purple/40 p-2 rounded-lg hover:bg-space-deep-purple/60 transition-all">
          <User className="h-4 w-4 text-amber-400" />
          <span className="text-sm">Account</span>
        </button>
      </div>
    </div>
  );
};

export default UserStatsOverview;
