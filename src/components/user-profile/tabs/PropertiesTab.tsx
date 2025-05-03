
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import { PropertyCardProps } from '@/components/PropertyCard';

interface PropertiesTabProps {
  userProperties: PropertyCardProps[];
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ userProperties }) => {
  const navigate = useNavigate();
  
  return (
    <>
      {userProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userProperties.map((property) => (
            <div key={property.id} onClick={() => navigate(`/property/${property.id}`)} className="cursor-pointer">
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You don't own any property tokens yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-space-neon-green rounded-md text-black font-bold hover:bg-opacity-80 transition-all"
          >
            Explore Properties
          </button>
        </div>
      )}
    </>
  );
};

export default PropertiesTab;
