
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
      <div className="px-6 md:px-8 z-10 pt-8 w-full max-w-[960px] md:max-w-[1280px] mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-4 ds-eyebrow">Tokenized Real Estate</div>
          <h1 className="ds-h1 mb-3">
            Invest in high‑quality properties with <span className="text-primary">fractional ownership</span>
          </h1>
          <p className="ds-body text-muted-foreground mb-8">
            EquiXtate is a modern marketplace for transparent, liquid, and secure real estate investing powered by blockchain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
            <Button 
              className="cosmic-btn flex items-center py-3 px-6"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={scrollToMarketplace}
            >
              <span className="mr-1">Explore properties</span>
              <ChevronRight className={`transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
            </Button>
            <Button 
              variant="outline"
              className="py-3 px-6"
              onClick={() => {
                const element = document.getElementById('tokenization');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it works
            </Button>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center glassmorphism p-2 rounded-lg">
              <input 
                type="text" 
                placeholder="Search properties by location, price, or ROI..."
                className="w-full bg-transparent py-3 px-4 outline-none text-white placeholder:text-gray-400 font-inter"
              />
              <Button size="icon" variant="secondary" className="shrink-0">
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
