
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { motion } from 'framer-motion';
import { PropertyCardProps } from '@/components/PropertyCard';

interface FeaturedPropertiesProps {
  featuredProperties: PropertyCardProps[];
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ featuredProperties }) => {
  return (
    <section id="properties" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-12 text-center">
          <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
            Featured Properties
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProperties.map(property => (
            <PropertyCard 
              key={property.id} 
              {...property}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Button className="cosmic-btn py-3 px-8" asChild>
            <Link to="/#marketplace">
              View All Properties <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
