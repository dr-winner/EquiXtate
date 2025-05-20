
import React from 'react';
import { TrendingUp, TrendingDown, ChartLine } from "lucide-react";
import MetricCard from './analytics/MetricCard';
import PortfolioChart from './analytics/PortfolioChart';
import ChartTooltipCustom from './analytics/ChartTooltipCustom';
import { portfolioData, calculateGrowth } from './analytics/AnalyticsData';

interface AnalyticsTabProps {
  stakedTokens: number;
  totalTokensOwned: number;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stakedTokens, totalTokensOwned }) => {
  const portfolioGrowth = calculateGrowth(portfolioData);
  const propertyGrowth = calculateGrowth(portfolioData.map(item => ({ month: item.month, value: item.propertyValue })));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Portfolio Growth"
          value={`${portfolioGrowth.toFixed(2)}%`}
          percentChange={portfolioGrowth}
          icon={portfolioGrowth > 0 ? TrendingUp : TrendingDown}
          iconColor={portfolioGrowth > 0 ? "text-space-neon-green" : "text-red-500"}
          subtitle="Last 6 months"
        />

        <MetricCard 
          title="Property Value Growth"
          value={`${propertyGrowth.toFixed(2)}%`}
          percentChange={propertyGrowth}
          icon={propertyGrowth > 0 ? TrendingUp : TrendingDown}
          iconColor={propertyGrowth > 0 ? "text-amber-400" : "text-red-500"}
          subtitle="Last 6 months"
        />

        <MetricCard 
          title="Token Utilization"
          value={`${totalTokensOwned > 0 ? ((stakedTokens / totalTokensOwned) * 100).toFixed(1) : 0}%`}
          icon={ChartLine}
          iconColor="text-space-neon-purple"
          subtitle="Staked vs. Owned"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PortfolioChart portfolioData={portfolioData} />
      </div>
    </div>
  );
};

export default AnalyticsTab;
