
import { useEffect, useMemo } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import MarketplaceSection from '@/components/MarketplaceSection';
import TokenizationSection from '@/components/TokenizationSection';
import Section from '@/components/layout/Section';
import PageContainer from '@/components/layout/PageContainer';
import Footer from '@/components/Footer';
import { properties } from '@/data/propertyData';
import { formatPrice, stringToPropertyType } from '@/utils/propertyUtils';
import { motion } from 'framer-motion';
import { fadeSlideUp } from '@/styles/motion-presets';
import { useInView } from 'react-intersection-observer';

// Import our new refactored components
import FeaturedProperties from '@/components/home/FeaturedProperties';
import InvestmentOpportunities from '@/components/home/InvestmentOpportunities';
import GovernanceSection from '@/components/home/GovernanceSection';
import CTASection from '@/components/home/CTASection';
import PartnersSection from '@/components/home/PartnersSection';

const Index = () => {
  // For scroll animation
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Get 3 featured properties (memoized)
  const featuredProperties = useMemo(
    () => properties
      .sort((a, b) => b.price - a.price)
      .slice(0, 3)
      .map(property => ({
        ...property,
        type: stringToPropertyType(property.type)
      })),
    []
  );

  return (
    <div className="min-h-screen bg-space-black text-white overflow-hidden">
      <StarField />
      <Navbar />
      
      <main>
        <HeroSection />

        <Section spacing="normal" dividerTop>
          <PageContainer>
            <motion.div
              id="marketplace"
              ref={ref}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={fadeSlideUp}
            >
              <MarketplaceSection />
            </motion.div>
          </PageContainer>
        </Section>

        <Section spacing="normal" dividerTop>
          <PageContainer>
            <div id="tokenization">
              <TokenizationSection />
            </div>
          </PageContainer>
        </Section>

        <Section spacing="normal" dividerTop>
          <PageContainer>
            <FeaturedProperties featuredProperties={featuredProperties} />
          </PageContainer>
        </Section>

        <Section spacing="normal" dividerTop>
          <PageContainer>
            <InvestmentOpportunities />
          </PageContainer>
        </Section>

        <Section spacing="normal" dividerTop>
          <PageContainer>
            <GovernanceSection />
          </PageContainer>
        </Section>

        <Section spacing="normal" dividerTop>
          <PageContainer>
            <PartnersSection />
          </PageContainer>
        </Section>

        <Section spacing="normal" dividerTop>
          <PageContainer>
            <CTASection />
          </PageContainer>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
