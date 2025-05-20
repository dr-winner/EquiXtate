
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Share2 } from 'lucide-react';

interface BlockchainDetailsProps {
  id: string;
}

const BlockchainDetails: React.FC<BlockchainDetailsProps> = ({ id }) => {
  return (
    <div className="glassmorphism p-4 mb-6">
      <h3 className="font-orbitron text-lg mb-3 text-white">Blockchain Details</h3>
      <p className="text-gray-300 font-inter mb-2 text-sm font-mono">Property ID: {id}</p>
      <p className="text-gray-300 font-inter mb-2 text-sm">Token Standard: ERC-1155</p>
      <div className="flex items-center">
        <Button variant="outline" className="text-xs border-space-neon-blue text-space-neon-blue mr-2">
          <Globe className="w-3 h-3 mr-1" />
          View on Explorer
        </Button>
        <Button variant="outline" className="text-xs border-space-neon-purple text-space-neon-purple">
          <Share2 className="w-3 h-3 mr-1" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default BlockchainDetails;
