
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from '@/utils/propertyUtils';
import { STABLECOIN_SYMBOL } from '@/types/property';
import { User, Wallet, History, Settings, HelpCircle, DollarSign, Percent, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { KYCTier } from '@/services/UserOnboardingService';

interface UserStatsProps {
  walletAddress: string;
  totalTokensOwned: number;
  totalHoldingsValue: number;
  rentalIncome: number;
  governanceInfluence: string;
  calculateTokenValue: (tokens: number) => number;
  userAvatarImage?: string;
  // KYC props
  isKYCVerified?: boolean;
  kycTier?: KYCTier;
  onStartKYC?: () => void;
}

const UserStatsOverview: React.FC<UserStatsProps> = ({
  walletAddress,
  totalTokensOwned,
  totalHoldingsValue,
  rentalIncome,
  governanceInfluence,
  calculateTokenValue,
  isKYCVerified = false,
  kycTier = KYCTier.NONE,
  onStartKYC,
}) => {
  // Create a random color for the avatar background based on wallet address
  const getColorFromAddress = (address: string): string => {
    const hash = address.slice(2, 8);
    return `#${hash}`;
  };

  const getKYCTierLabel = (tier: KYCTier): string => {
    switch (tier) {
      case KYCTier.BASIC: return 'Basic';
      case KYCTier.STANDARD: return 'Standard';
      case KYCTier.ENHANCED: return 'Enhanced';
      default: return 'Unverified';
    }
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
          
          {/* KYC Status Badge - Inline */}
          {isKYCVerified ? (
            <Badge className="mt-2 ml-2 bg-space-neon-green/20 border border-space-neon-green text-space-neon-green">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              KYC Verified
            </Badge>
          ) : (
            <Badge 
              className="mt-2 ml-2 bg-yellow-500/20 border border-yellow-500 text-yellow-500 cursor-pointer hover:bg-yellow-500/30 transition-all"
              onClick={onStartKYC}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Verify Identity
            </Badge>
          )}
        </div>
      </div>

      {/* KYC Verification Card - Only show if NOT verified */}
      {!isKYCVerified && (
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Shield className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Identity Verification Required</p>
                <p className="text-xs text-gray-400">Complete KYC to unlock all features</p>
              </div>
            </div>
            <button
              onClick={onStartKYC}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 transition-all"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}

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
