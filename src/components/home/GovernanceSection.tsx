
import React from 'react';
import { Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notifyFeatureComingSoon } from '@/utils/buttonUtils';
import { scrollToSection } from '@/utils/buttonUtils';

const GovernanceSection: React.FC = () => {
  const showAllProposals = () => {
    notifyFeatureComingSoon("Governance Proposals");
  };

  return (
    <section id="governance" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-12 text-center">
          <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
            Governance & DAO
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glassmorphism p-6 border border-space-neon-purple/30">
            <Gavel className="h-10 w-10 text-space-neon-blue mb-4" />
            <h3 className="text-xl font-orbitron mb-3">Democratic Property Management</h3>
            <p className="text-gray-300 mb-4">
              Every token holder has a voice in property decisions. Vote on maintenance, renovations, tenant selection, and more based on your ownership stake.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-space-deep-purple/30 p-3 rounded-md">
                <p className="text-sm text-gray-400">Voting Power</p>
                <p className="text-lg text-space-neon-green">1 Token = 1 Vote</p>
              </div>
              <div className="bg-space-deep-purple/30 p-3 rounded-md">
                <p className="text-sm text-gray-400">Proposal Threshold</p>
                <p className="text-lg text-space-neon-blue">100 Tokens</p>
              </div>
            </div>
            <Button 
              onClick={() => scrollToSection("governance")}
              variant="outline" 
              className="w-full border-space-neon-blue text-space-neon-blue"
            >
              Learn About Governance
            </Button>
          </div>
          
          <div className="glassmorphism p-6 border border-space-neon-purple/30">
            <div className="mb-6">
              <h3 className="text-xl font-orbitron mb-3">Active Proposals</h3>
              <div className="space-y-4">
                <div className="bg-space-deep-purple/50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <p className="font-bold text-space-neon-green">Renovation Fund</p>
                    <span className="bg-space-neon-green/20 text-space-neon-green px-2 py-1 rounded-md text-xs">Active</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">Allocate 5% of rental income to East Legon property renovations</p>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-space-neon-green h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">65% in favor</span>
                    <span className="text-gray-400">3 days left</span>
                  </div>
                </div>
                
                <div className="bg-space-deep-purple/50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <p className="font-bold text-space-neon-purple">New Property Acquisition</p>
                    <span className="bg-space-neon-purple/20 text-space-neon-purple px-2 py-1 rounded-md text-xs">Active</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">Acquire new residential property in Airport Residential Area</p>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-space-neon-purple h-full rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">78% in favor</span>
                    <span className="text-gray-400">5 days left</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={showAllProposals}
              className="w-full cosmic-btn"
            >
              View All Proposals
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GovernanceSection;
