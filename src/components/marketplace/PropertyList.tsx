
import React from 'react';
import { motion } from 'framer-motion';
import { FilterX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PropertyCard, { PropertyCardProps } from '../PropertyCard';

interface PropertyListProps {
  properties: PropertyCardProps[];
  title?: string;
  showClearFiltersButton?: boolean;
  onClearFilters?: () => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  title,
  showClearFiltersButton = false,
  onClearFilters
}) => {
  return (
    <div className={title ? "mt-16" : ""}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-orbitron text-white">{title}</h3>
          {showClearFiltersButton && onClearFilters && (
            <Button variant="secondary" onClick={onClearFilters}>
              <FilterX className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))
        ) : (
          <div className="text-center text-gray-400 col-span-full">
            No properties found matching the criteria.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PropertyList;
