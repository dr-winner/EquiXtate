
import React from 'react';

interface InvestmentMetricsProps {
  roi?: number;
  rentalYield?: number;
  rentalIncome?: number;
}

const InvestmentMetrics: React.FC<InvestmentMetricsProps> = ({
  roi,
  rentalYield,
  rentalIncome
}) => {
  if (!roi) return null;

  return (
    <div className="glassmorphism p-4 mb-6">
      <h3 className="font-orbitron text-lg mb-3 text-white">Investment Metrics</h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-gray-400">Projected ROI</p>
          <p className="text-space-neon-green font-semibold">{roi}%</p>
        </div>
        
        {rentalYield && (
          <div>
            <p className="text-xs text-gray-400">Rental Yield</p>
            <p className="text-space-neon-blue font-semibold">{rentalYield}%</p>
          </div>
        )}
        
        {rentalIncome && (
          <div>
            <p className="text-xs text-gray-400">Monthly Income</p>
            <p className="text-space-neon-purple font-semibold">${rentalIncome}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentMetrics;
