
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, ChevronRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const scrollToMarketplace = () => {
    const marketplaceSection = document.getElementById('marketplace');
    if (marketplaceSection) {
      marketplaceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="home" className="relative min-h-screen flex items-center justify-center pt-16">
      {/* Animated floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-space-neon-purple/20 blur-3xl animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full bg-space-neon-blue/20 blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-32 h-32 rounded-full bg-space-neon-green/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Blockchain symbols floating in the background */}
      <div className="absolute top-1/5 right-1/3 text-space-neon-blue/30 text-4xl animate-float" style={{ animationDelay: '1.2s' }}>₿</div>
      <div className="absolute bottom-1/4 left-1/4 text-space-neon-purple/30 text-5xl animate-float" style={{ animationDelay: '2.5s' }}>Ξ</div>
      <div className="absolute top-2/3 right-1/4 text-space-neon-green/30 text-3xl animate-float" style={{ animationDelay: '3.2s' }}>◎</div>
      
      <div className="container px-4 z-10 pt-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* EquiXtate Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-space-neon-purple to-space-neon-blue flex items-center justify-center">
                <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-space-neon-purple to-space-neon-blue opacity-70"></div>
                <div className="relative z-10 font-orbitron text-4xl font-bold text-white">
                  <span className="mr-1">E</span>
                  <span className="text-space-neon-green">x</span>
                </div>
              </div>
            </div>
          </div>
        
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold mb-6 animate-text-flicker">
            <span className="block text-space-neon-green neon-glow-green">COSMIC</span>
            <span className="block bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
              EQUI<span className="text-space-neon-blue font-bold neon-glow">X</span>TATE
            </span>
            <span className="block text-white">MARKETPLACE</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-spacegrotesk mb-8 max-w-3xl mx-auto">
            The first fully-decentralized platform for tokenized real estate ownership on the blockchain
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Button 
              className="cosmic-btn flex items-center py-6 px-8 text-lg"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={scrollToMarketplace}
            >
              <span className="mr-2">Explore Properties</span>
              <ChevronRight className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </Button>
            
            <Button 
              variant="outline" 
              className="border-2 border-space-neon-blue text-space-neon-blue hover:bg-space-neon-blue/10 hover:text-white transition-all duration-300 py-6 px-8 text-lg"
              onClick={() => {
                const element = document.getElementById('tokenization');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn How It Works
            </Button>
          </div>
          
          <div className="relative max-w-2xl mx-auto mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-space-neon-purple to-space-neon-blue rounded-lg blur opacity-50"></div>
            <div className="relative flex items-center glassmorphism p-2 rounded-lg">
              <input 
                type="text" 
                placeholder="Search tokenized properties by location or price..."
                className="w-full bg-transparent py-3 px-4 outline-none text-white placeholder:text-gray-400 font-inter"
              />
              <Button size="icon" className="bg-space-neon-blue hover:bg-space-neon-purple transition-colors duration-300">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
