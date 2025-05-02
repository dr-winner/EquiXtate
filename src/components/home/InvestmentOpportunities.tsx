
import React from 'react';
import { ChartBar, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notifyFeatureComingSoon } from '@/utils/buttonUtils';
import { formatPrice } from '@/utils/propertyUtils';

const InvestmentOpportunities: React.FC = () => {
  const handleExploreFractional = () => {
    notifyFeatureComingSoon("Fractional Properties");
  };
  
  const handleExplorePoolsClick = () => {
    notifyFeatureComingSoon("Property Pools");
  };

  return (
    <section id="invest" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-12 text-center">
          <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
            Investment Opportunities
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="glassmorphism border-space-neon-purple/30 overflow-hidden">
            <CardHeader>
              <ChartBar className="text-space-neon-blue h-8 w-8 mb-2" />
              <CardTitle className="text-white text-2xl font-orbitron">Fractional Ownership</CardTitle>
              <CardDescription className="text-gray-300">
                Own a fraction of premium Ghanaian real estate with as little as {formatPrice(145)}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-space-neon-green mr-2">•</span>
                  <span>Access to otherwise inaccessible high-value properties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-space-neon-green mr-2">•</span>
                  <span>Automatic rental income distributions via smart contracts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-space-neon-green mr-2">•</span>
                  <span>Liquidity through token trading on secondary markets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-space-neon-green mr-2">•</span>
                  <span>Voting rights on property management decisions</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleExploreFractional}
                className="w-full bg-space-deep-purple hover:bg-space-deep-purple/80 text-space-neon-blue"
              >
                Explore Fractional Properties
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="glassmorphism border-space-neon-purple/30 overflow-hidden">
            <CardHeader>
              <Users className="text-space-neon-purple h-8 w-8 mb-2" />
              <CardTitle className="text-white text-2xl font-orbitron">Property Pools</CardTitle>
              <CardDescription className="text-gray-300">
                Invest in diversified portfolios of Ghana's finest real estate
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-space-neon-purple mr-2">•</span>
                  <span>Instant diversification across multiple properties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-space-neon-purple mr-2">•</span>
                  <span>Reduced risk through property type and location diversity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-space-neon-purple mr-2">•</span>
                  <span>Professional property management and maintenance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-space-neon-purple mr-2">•</span>
                  <span>Lower barrier to entry with smaller minimum investment</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleExplorePoolsClick}
                className="w-full bg-space-deep-purple hover:bg-space-deep-purple/80 text-space-neon-purple"
              >
                Discover Property Pools
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default InvestmentOpportunities;
