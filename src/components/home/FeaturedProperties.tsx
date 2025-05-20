
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Percent, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { motion } from 'framer-motion';
import { PropertyCardProps } from '@/components/PropertyCard';
import { EQUIX_TOKEN_VALUE } from '@/types/property';

interface FeaturedPropertiesProps {
  featuredProperties: PropertyCardProps[];
}

// Enhanced version showing more property details
const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ featuredProperties }) => {
  // Calculate ownership percentage using the correct formula
  const calculateOwnershipPercentage = (tokens: number, propertyValue: number): number => {
    const tokenValue = tokens * EQUIX_TOKEN_VALUE;
    return (tokenValue / propertyValue) * 100;
  };

  return (
    <section id="properties" className="py-12 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron">
              <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
                Featured Properties
              </span>
            </h2>
            <p className="text-gray-300 mt-2 md:mt-0 max-w-xl text-sm sm:text-base">
              Explore our curated selection of prime real estate opportunities with verified tokenization status.
            </p>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {featuredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col h-full"
            >
              <PropertyCard 
                {...property}
              />
              
              {/* Additional property financial details */}
              <div className="mt-3 glassmorphism p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-space-neon-green">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm font-medium">Valuation:</span>
                  </div>
                  <span className="font-semibold text-white text-xs sm:text-sm">
                    ${property.price.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-space-neon-blue">
                    <Percent className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm font-medium">Min. Ownership:</span>
                  </div>
                  <span className="font-semibold text-white text-xs sm:text-sm">
                    {calculateOwnershipPercentage(property.minInvestment || 10, property.price).toFixed(4)}%
                  </span>
                </div>
                
                {property.roi && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-space-neon-purple">
                      <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="text-xs sm:text-sm font-medium">Rental Yield:</span>
                    </div>
                    <span className="font-semibold text-white text-xs sm:text-sm">
                      {property.roi}%
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center">
          <Button className="cosmic-btn py-2 px-4 sm:py-3 sm:px-8" asChild>
            <Link to="/#marketplace">
              View All Properties <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
