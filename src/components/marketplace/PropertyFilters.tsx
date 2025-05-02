
import React from 'react';
import { FilterX } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-orbitron text-white">
          Explore Real Estate
        </h2>
        
        <Input 
          type="text"
          placeholder="Search properties..."
          className="max-w-xs bg-space-deep-purple/30 border-space-deep-purple text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="bg-space-deep-purple/20 rounded-md p-1 w-full lg:w-max">
          <TabsTrigger value="all" onClick={() => handleFilterChange('all')}>All Listings</TabsTrigger>
          <TabsTrigger value="buy" onClick={() => handleFilterChange('buy')}>Buy</TabsTrigger>
          <TabsTrigger value="rent" onClick={() => handleFilterChange('rent')}>Rent</TabsTrigger>
          <TabsTrigger value="fractional" onClick={() => handleFilterChange('fractional')}>Fractional</TabsTrigger>
          <TabsTrigger value="auction" onClick={() => handleFilterChange('auction')}>Auction</TabsTrigger>
        </TabsList>
        
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
