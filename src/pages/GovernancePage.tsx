
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GovernancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-space-black to-space-deep-purple flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="glassmorphism rounded-xl p-6 mt-8">
          <h1 className="text-3xl font-bold text-white mb-6">Governance</h1>
          
          <div className="space-y-8">
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-2xl font-bold text-white mb-4">Participate in Governance</h2>
              <p className="text-gray-300 mb-4">
                As an EquiXtate token holder, you have the power to participate in governance decisions
                that shape the future of the platform and its properties.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-space-black/50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-2">Active Proposals</h3>
                  <p className="text-gray-400">View and vote on current property and platform proposals</p>
                </div>
                <div className="bg-space-black/50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-2">Submit Proposal</h3>
                  <p className="text-gray-400">Submit your own proposal for community voting</p>
                </div>
              </div>
            </div>
            
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-2xl font-bold text-white mb-4">Governance Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-space-black/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-space-neon-blue">12</div>
                  <div className="text-sm text-gray-400">Active Proposals</div>
                </div>
                <div className="bg-space-black/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-space-neon-blue">156</div>
                  <div className="text-sm text-gray-400">Total Votes</div>
                </div>
                <div className="bg-space-black/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-space-neon-blue">45%</div>
                  <div className="text-sm text-gray-400">Participation Rate</div>
                </div>
                <div className="bg-space-black/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-space-neon-blue">8</div>
                  <div className="text-sm text-gray-400">Proposals Passed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GovernancePage;
