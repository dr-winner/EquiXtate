
import React from 'react';
import MobileNavLink from './MobileNavLink';
import { AnimatePresence, motion } from 'framer-motion';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  mobileMenuOpen,
  activeSection,
  scrollToSection
}) => {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden absolute top-full left-0 right-0 glassmorphism z-50"
        >
          <div className="flex flex-col p-4">
            <MobileNavLink
              href="/"
              isActive={activeSection === 'hero'}
              onClick={() => scrollToSection('hero')}
            >
              Home
            </MobileNavLink>
            
            <MobileNavLink
              href="/#marketplace"
              isActive={activeSection === 'marketplace'}
              onClick={() => scrollToSection('marketplace')}
            >
              Marketplace
            </MobileNavLink>
            
            <MobileNavLink
              href="/#tokenization"
              isActive={activeSection === 'tokenization'}
              onClick={() => scrollToSection('tokenization')}
            >
              Tokenization
            </MobileNavLink>
            
            <MobileNavLink
              href="/profile"
              isActive={false}
            >
              Profile
            </MobileNavLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
