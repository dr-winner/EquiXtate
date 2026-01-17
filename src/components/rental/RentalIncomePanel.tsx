import React, { useState, useMemo } from 'react';
import { useRentClaims, formatRentAmount, formatAPY, formatSharePercentage } from '@/hooks/useRentClaims';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign,
  PiggyBank,
  Loader2,
  History,
  RefreshCw
} from 'lucide-react';

interface RentalIncomePanelProps {
  walletAddress: string;
  propertyToken?: string;
  propertyTokens?: string[];
}

export function RentalIncomePanel({ 
  walletAddress, 
  propertyToken,
  propertyTokens = []
}: RentalIncomePanelProps) {
  const [selectedProperty, setSelectedProperty] = useState(propertyToken);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    totalPendingRent,
    userInfo,
    propertyInfo,
    estimatedAPY,
    distributionHistory,
    claimRent,
    claimAllRent,
    isClaiming,
    error,
    refresh,
  } = useRentClaims(walletAddress, selectedProperty);

  const handleClaim = async () => {
    if (selectedProperty) {
      await claimRent(selectedProperty);
    }
  };

  const handleClaimAll = async () => {
    if (propertyTokens.length > 0) {
      await claimAllRent(propertyTokens);
    }
  };

  // Format the dates
  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Never';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-emerald-400" />
            Rental Income
          </h2>
          <p className="text-slate-400 mt-1">
            Claim your share of rental distributions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Pending */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-lg p-5 border border-emerald-700/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-emerald-400 text-sm font-medium">Available to Claim</span>
            <Wallet className="w-5 h-5 text-emerald-400/50" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${formatRentAmount(totalPendingRent || 0n)}
          </p>
          <p className="text-sm text-slate-400">
            From all properties
          </p>
        </div>

        {/* Current Property Pending */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-5 border border-blue-700/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-400 text-sm font-medium">This Property</span>
            <DollarSign className="w-5 h-5 text-blue-400/50" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${formatRentAmount(userInfo?.pending || 0n)}
          </p>
          <p className="text-sm text-slate-400">
            Your share: {formatSharePercentage(userInfo?.sharePercentage || 0n)}
          </p>
        </div>

        {/* Estimated APY */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-5 border border-purple-700/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-purple-400 text-sm font-medium">Estimated APY</span>
            <TrendingUp className="w-5 h-5 text-purple-400/50" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {formatAPY(estimatedAPY || 0n)}
          </p>
          <p className="text-sm text-slate-400">
            Based on recent distributions
          </p>
        </div>
      </div>

      {/* Claim Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleClaim}
          disabled={isClaiming || !selectedProperty || !userInfo?.pending}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          {isClaiming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Claim from This Property
            </>
          )}
        </Button>
        {propertyTokens.length > 1 && (
          <Button
            onClick={handleClaimAll}
            disabled={isClaiming || !totalPendingRent}
            variant="outline"
            className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Claim All
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-6">
          {error.message}
        </div>
      )}

      {/* Tabs for Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-700/50 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Stats */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-4">Your Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Token Balance</span>
                  <span className="text-white font-medium">
                    {formatRentAmount(userInfo?.tokenBalance || 0n, 18)} tokens
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ownership Share</span>
                  <span className="text-white font-medium">
                    {formatSharePercentage(userInfo?.sharePercentage || 0n)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Claimed</span>
                  <span className="text-emerald-400 font-medium">
                    ${formatRentAmount(userInfo?.totalClaimed || 0n)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Claim</span>
                  <span className="text-slate-300 text-sm">
                    {formatDate(userInfo?.lastClaimTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-4">Property Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Distributed</span>
                  <span className="text-white font-medium">
                    ${formatRentAmount(propertyInfo?.totalDistributed || 0n)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Distribution Count</span>
                  <span className="text-white font-medium">
                    {propertyInfo?.distributionCount?.toString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Distribution</span>
                  <span className="text-slate-300 text-sm">
                    {formatDate(propertyInfo?.lastDistributionTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-medium ${propertyInfo?.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {propertyInfo?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-slate-700/30 rounded-lg overflow-hidden">
            {distributionHistory && distributionHistory.length > 0 ? (
              <div className="divide-y divide-slate-700">
                {distributionHistory.map((dist, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        ${formatRentAmount(dist.amount)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {dist.description || 'Rental income distribution'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-sm">
                        {formatDate(dist.timestamp)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRentAmount(dist.totalShares, 18)} total shares
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No distribution history yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Distributions will appear here when rental income is deposited
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RentalIncomePanel;
