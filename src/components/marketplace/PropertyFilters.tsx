
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface PropertyFiltersProps {
  activeFilter: string;
  searchTerm: string;
  handleFilterChange: (filter: string) => void;
  setSearchTerm: (term: string) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  activeFilter,
  searchTerm,
  handleFilterChange,
  setSearchTerm
}) => {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-orbitron text-white">
          Explore Real Estate
        </h2>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="bg-space-deep-purple/20 rounded-md p-1 w-full overflow-x-auto flex whitespace-nowrap scrollbar-hide">
          <TabsTrigger value="all" onClick={() => handleFilterChange('all')}>All Listings</TabsTrigger>
          <TabsTrigger value="buy" onClick={() => handleFilterChange('buy')}>Buy</TabsTrigger>
          <TabsTrigger value="rent" onClick={() => handleFilterChange('rent')}>Rent</TabsTrigger>
          <TabsTrigger value="fractional" onClick={() => handleFilterChange('fractional')}>Fractional</TabsTrigger>
          <TabsTrigger value="auction" onClick={() => handleFilterChange('auction')}>Auction</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 relative">
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by location, price or property type..."
              className="bg-space-deep-purple/20 border-space-neon-blue/30 text-white placeholder:text-gray-400 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Add content for each tab if needed */}
        <TabsContent value="all"></TabsContent>
        <TabsContent value="buy"></TabsContent>
        <TabsContent value="rent"></TabsContent>
        <TabsContent value="fractional"></TabsContent>
        <TabsContent value="auction"></TabsContent>
      </Tabs>
    </>
  );
};

export default PropertyFilters;
