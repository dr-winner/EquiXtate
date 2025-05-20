
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface PropertyHeaderProps {
  title: string;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button 
        variant="ghost" 
        className="mb-6 text-space-neon-blue hover:text-space-neon-purple"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Button>
      
      <h1 className="sr-only">{title}</h1>
    </>
  );
};

export default PropertyHeader;
