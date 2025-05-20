/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import MarketplaceSection from '@/components/MarketplaceSection';
import TokenizationSection from '@/components/TokenizationSection';
import Footer from '@/components/Footer';
import { properties } from '@/data/propertyData';
import { stringToPropertyType } from '@/utils/propertyUtils';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Import our components
import FeaturedProperties from '@/components/home/FeaturedProperties';
import InvestmentOpportunities from '@/components/home/InvestmentOpportunities';
import GovernanceSection from '@/components/home/GovernanceSection';
import AboutSection from '@/components/home/AboutSection';
import Web3Service from '@/services/Web3Service';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AuthenticationModal from '@/components/auth/AuthenticationModal';
import { useAuthenticationModal } from '@/hooks/use-authentication-modal';
import { ethers } from 'krnl-sdk';
import { KERNEL_ID } from '@/krnl/1529/config';
import { executeKrnl } from '@/krnl/1529';

const Index = () => {
  // For scroll animation
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const navigate = useNavigate();
  const { isOpen: isAuthModalOpen, openModal: openAuthModal } = useAuthenticationModal();





  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  useEffect(() => {
    // Check if user is authenticated and wallet is connected
    const checkAuth = async () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);

      const connected = await Web3Service.isWalletConnected();
      setWalletConnected(connected);
    };

    checkAuth();
  }, []);


  // Get featured properties and enhance them with additional properties
  const featuredProperties = properties
    .sort((a, b) => b.price - a.price)
    .slice(0, 3)
    .map(property => ({
      ...property,
      type: stringToPropertyType(property.type),
      minInvestment: 10, // Minimum 10 EquiX tokens
      ownershipPercentage: 10 / 1000, // 10 tokens out of 1000 total = 1%
      rentalYield: property.roi || Math.floor(Math.random() * 5) + 5, // Random 5-10% if not specified
    }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would redirect to search results
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await Web3Service.connectWallet();
      setWalletConnected(true);

      // Check if user is already authenticated
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';

      if (!authStatus) {
        // Show authentication modal if not authenticated
        setTimeout(() => {
          openAuthModal();
        }, 500);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };


  return (
    <div className="min-h-screen bg-space-black text-white overflow-hidden">
      <StarField />
      <Navbar />

      <main>
        <div className="relative">
          <HeroSection />

          {/* Removed the carousel section */}
        </div>

        <AboutSection />

        <motion.div
          id="marketplace"
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 }
          }}
          transition={{ duration: 0.5 }}
        >
          <MarketplaceSection />
        </motion.div>

        <section id="tokenization">
          <TokenizationSection />
        </section>

        {/* Using our components */}
        <FeaturedProperties featuredProperties={featuredProperties} />
        <InvestmentOpportunities />
        <GovernanceSection />

        {/* Enhanced CTA section with wallet connection */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="glassmorphism p-8 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="lg:w-2/3 mb-6 lg:mb-0">
                  <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
                    <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
                      Ready to Transform Real Estate Investment?
                    </span>
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-xl">
                    Join thousands of investors who are already revolutionizing the Ghana real estate market through
                    blockchain technology and fractional ownership. Start with as little as 10 EquiX tokens.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={handleConnectWallet}
                      className="cosmic-btn py-3 px-6"
                    >
                      {walletConnected
                        ? isAuthenticated
                          ? "View Dashboard"
                          : "Complete Verification"
                        : "Connect Wallet"
                      }
                    </Button>
                    <Button
                      onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
                      className="border border-space-neon-blue py-3 px-6 rounded-lg text-space-neon-blue hover:bg-space-neon-blue/10 transition-colors"
                    >
                      Explore Properties
                    </Button>
                  </div>
                </div>

                <div className="lg:w-1/3">
                  <div className="relative three-d-card">
                    <div className="absolute inset-0 bg-neon-gradient rounded-xl blur-lg opacity-20"></div>
                    <img
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80"
                      alt="Modern Property Investment"
                      className="relative z-10 rounded-xl h-64 w-full object-cover border border-space-neon-blue/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AuthenticationModal
        isOpen={isAuthModalOpen}
        onClose={() => { }}
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
        }}
      />

      <Footer />
    </div>
  );
};

export default Index;
