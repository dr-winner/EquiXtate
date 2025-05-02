
import { useState } from 'react';
import { PropertyCardProps } from '@/components/PropertyCard';
import { properties } from '@/data/propertyData';
import { formatPrice, stringToPropertyType } from '@/utils/propertyUtils';

export const usePropertyData = () => {
  const [propertyListing] = useState<PropertyCardProps[]>(
    properties.map(p => ({
      ...p, 
      type: stringToPropertyType(p.type)
    }))
  );

  return {
    propertyListing,
    formatPrice
  };
};
