
import React from 'react';
import { BarChart3, Coins, Banknote } from 'lucide-react';

interface PropertyInvestmentMetricsProps {
  roi?: number;
  rentalYield?: number;
  rentalIncome?: number;
}

const PropertyInvestmentMetrics: React.FC<PropertyInvestmentMetricsProps> = ({
  roi,
  rentalYield,
  rentalIncome
}) => {
  if (!roi && !rentalYield && !rentalIncome) return null;
  
  return (
    <div className="glassmorphism p-4 mb-6">
      <h3 className="font-orbitron mb-3">Investment Metrics</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {roi && (
          <div className="text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-1 text-space-neon-green" />
            <p className="text-xs text-gray-400">Projected ROI</p>
            <p className="text-lg font-semibold text-space-neon-green">{roi}%</p>
          </div>
        )}
        
        {rentalYield && (
          <div className="text-center">
            <Coins className="w-6 h-6 mx-auto mb-1 text-space-neon-blue" />
            <p className="text-xs text-gray-400">Rental Yield</p>
            <p className="text-lg font-semibold text-space-neon-blue">{rentalYield}%</p>
          </div>
        )}
        
        {rentalIncome && (
          <div className="text-center">
            <Banknote className="w-6 h-6 mx-auto mb-1 text-space-neon-purple" />
            <p className="text-xs text-gray-400">Monthly Income</p>
            <p className="text-lg font-semibold text-space-neon-purple">${rentalIncome}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyInvestmentMetrics;
