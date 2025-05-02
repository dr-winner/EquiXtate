
import { useState } from 'react';
import { PropertyCardProps } from '@/components/PropertyCard';

export const usePropertyFilters = (propertyListing: PropertyCardProps[]) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };
  
  const filteredProperties = propertyListing.filter(property => {
    const matchesFilter = 
      activeFilter === 'all' || 
      property.type.toLowerCase() === activeFilter.toLowerCase();
      
    const matchesSearch = 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  return {
    activeFilter,
    searchTerm,
    filteredProperties,
    handleFilterChange,
    setSearchTerm
  };
};
