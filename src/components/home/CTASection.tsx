
import React from 'react';
import { Button } from '@/components/ui/button';
import Web3Service from '@/services/Web3Service';
import { toast } from '@/components/ui/use-toast';
import { scrollToSection } from '@/utils/buttonUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const CTASection: React.FC = () => {
  const isMobile = useIsMobile();
  
  const handleConnectWallet = async () => {
    try {
      const connected = await Web3Service.connectWallet();
      if (connected) {
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been connected successfully!",
        });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="glassmorphism p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-6 lg:mb-0">
              <h2 className="text-2xl md:text-4xl font-orbitron font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
                  Ready to Enter the Future
                </span>
              </h2>
              <p className="text-gray-300 mb-6 max-w-lg font-inter text-sm md:text-base">
                Join thousands of investors who are already transforming the Ghana real estate 
                market through blockchain technology and fractional ownership.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Button 
                  onClick={handleConnectWallet}
                  className="cosmic-btn py-2 md:py-3 px-4 md:px-6 font-spacegrotesk text-sm md:text-base"
                >
                  Connect Wallet
                </Button>
                <Button 
                  onClick={() => scrollToSection("properties")}
                  className="py-2 md:py-3 px-4 md:px-6 border border-space-neon-blue text-space-neon-blue hover:bg-space-neon-blue/10 rounded-lg transition-colors duration-300 font-spacegrotesk text-sm md:text-base"
                >
                  Explore Properties
                </Button>
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative three-d-card w-full md:max-w-md">
                <div className="absolute inset-0 bg-neon-gradient rounded-lg blur-xl opacity-30"></div>
                <img
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80"
                  alt="Luxury Estate Property"
                  className="relative z-10 rounded-lg object-cover w-full border border-space-neon-purple/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
