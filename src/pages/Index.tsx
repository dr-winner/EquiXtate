
import React, { useEffect } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import MarketplaceSection from '@/components/MarketplaceSection';
import TokenizationSection from '@/components/TokenizationSection';
import Footer from '@/components/Footer';
import { properties } from '@/data/propertyData';
import { formatPrice, stringToPropertyType } from '@/utils/propertyUtils';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Import our new refactored components
import FeaturedProperties from '@/components/home/FeaturedProperties';
import InvestmentOpportunities from '@/components/home/InvestmentOpportunities';
import GovernanceSection from '@/components/home/GovernanceSection';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  // For scroll animation
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Get 3 featured properties
  const featuredProperties = properties
    .sort((a, b) => b.price - a.price)
    .slice(0, 3)
    .map(property => ({
      ...property,
      type: stringToPropertyType(property.type)
    }));

  return (
    <div className="min-h-screen bg-space-black text-white overflow-hidden">
      <StarField />
      <Navbar />
      
      <main>
        <HeroSection />
        
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
        
        {/* Using our new refactored components */}
        <FeaturedProperties featuredProperties={featuredProperties} />
        <InvestmentOpportunities />
        <GovernanceSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
