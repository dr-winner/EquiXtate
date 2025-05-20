
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import { PropertyCardProps } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Grid2x2, List } from 'lucide-react';

interface PropertiesTabProps {
  userProperties: PropertyCardProps[];
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ userProperties }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<string>('value-high');
  
  // Sort properties based on selected order
  const sortedProperties = [...userProperties].sort((a, b) => {
    switch(sortOrder) {
      case 'value-high':
        return b.price - a.price;
      case 'value-low':
        return a.price - b.price;
      case 'tokens-high':
        return (b.userTokenBalance || 0) - (a.userTokenBalance || 0);
      case 'tokens-low':
        return (a.userTokenBalance || 0) - (b.userTokenBalance || 0);
      case 'yield-high':
        return (b.rentalYield || 0) - (a.rentalYield || 0);
      case 'yield-low':
        return (a.rentalYield || 0) - (b.rentalYield || 0);
      default:
        return 0;
    }
  });
  
  if (userProperties.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 mb-4">You don't own any property tokens yet.</p>
        <Button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-space-neon-green rounded-md text-black font-bold hover:bg-opacity-80 transition-all"
        >
          Explore Properties
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-orbitron mb-2 sm:mb-0">Your Investment Portfolio</h3>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center border border-space-deep-purple rounded-lg overflow-hidden">
            <Button 
              variant="ghost" 
              className={`p-2 h-9 ${viewMode === 'grid' ? 'bg-space-deep-purple/50 text-space-neon-blue' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              className={`p-2 h-9 ${viewMode === 'list' ? 'bg-space-deep-purple/50 text-space-neon-blue' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="bg-space-deep-purple/30 border-space-deep-purple w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value-high">Highest Value</SelectItem>
                <SelectItem value="value-low">Lowest Value</SelectItem>
                <SelectItem value="tokens-high">Most Tokens</SelectItem>
                <SelectItem value="tokens-low">Least Tokens</SelectItem>
                <SelectItem value="yield-high">Highest Yield</SelectItem>
                <SelectItem value="yield-low">Lowest Yield</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
        : "flex flex-col space-y-4"
      }>
        {sortedProperties.map((property) => (
          <div 
            key={property.id} 
            onClick={() => navigate(`/property/${property.id}`)} 
            className={`cursor-pointer transition-all ${
              viewMode === 'list' ? "glassmorphism p-4 rounded-lg flex flex-col md:flex-row items-center gap-4" : ""
            }`}
          >
            {viewMode === 'list' ? (
              <>
                <div className="w-full md:w-1/4 mb-4 md:mb-0">
                  <img 
                    src={property.image} 
                    alt={property.name} 
                    className="rounded-lg w-full h-40 object-cover"
                  />
                </div>
                <div className="w-full md:w-3/4">
                  <h4 className="text-lg font-bold">{property.name}</h4>
                  <p className="text-gray-400">{property.location}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-gray-400">Value</p>
                      <p className="font-semibold text-space-neon-green">${property.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Your Tokens</p>
                      <p className="font-semibold text-space-neon-blue">{property.userTokenBalance} EquiX</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Rental Yield</p>
                      <p className="font-semibold text-amber-400">{property.rentalYield}%</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <PropertyCard {...property} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PropertiesTab;
