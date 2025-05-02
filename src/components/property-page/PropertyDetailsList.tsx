
import React from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';

interface PropertyDetailsListProps {
  location: string;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  ownerCount: number;
}

const PropertyDetailsList: React.FC<PropertyDetailsListProps> = ({
  location,
  squareFeet,
  bedrooms,
  bathrooms,
  yearBuilt,
  ownerCount
}) => {
  return (
    <div className="glassmorphism p-4 mt-6">
      <h3 className="font-orbitron text-lg mb-3">Property Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-space-neon-blue" />
          <span>Location: {location}</span>
        </div>
        
        {squareFeet && (
          <div className="flex items-center">
            <span className="w-4 h-4 mr-2 text-space-neon-blue">📏</span>
            <span>Area: {squareFeet} sq ft</span>
          </div>
        )}
        
        {bedrooms && (
          <div className="flex items-center">
            <span className="w-4 h-4 mr-2 text-space-neon-blue">🛏️</span>
            <span>Bedrooms: {bedrooms}</span>
          </div>
        )}
        
        {bathrooms && (
          <div className="flex items-center">
            <span className="w-4 h-4 mr-2 text-space-neon-blue">🚿</span>
            <span>Bathrooms: {bathrooms}</span>
          </div>
        )}
        
        {yearBuilt && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-space-neon-blue" />
            <span>Year Built: {yearBuilt}</span>
          </div>
        )}
        
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-space-neon-blue" />
          <span>Token Holders: {ownerCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsList;
