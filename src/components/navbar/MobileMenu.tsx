
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
            {isHomePage ? (
              <>
                <MobileNavLink
                  href="#hero"
                  isActive={activeSection === 'hero'}
                  onClick={() => scrollToSection('hero')}
                >
                  Home
                </MobileNavLink>
                
                <MobileNavLink
                  href="#marketplace"
                  isActive={activeSection === 'marketplace'}
                  onClick={() => scrollToSection('marketplace')}
                >
                  Marketplace
                </MobileNavLink>
                
                <MobileNavLink
                  href="#tokenization"
                  isActive={activeSection === 'tokenization'}
                  onClick={() => scrollToSection('tokenization')}
                >
                  Tokenization
                </MobileNavLink>
              </>
            ) : (
              <Link
                to="/"
                className="font-spacegrotesk flex items-center py-2 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-space-deep-purple/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-space-neon-purple"
                aria-label="Home"
              >
                Home
              </Link>
            )}
            
            <Link 
              to="/profile"
              className={`font-spacegrotesk flex items-center py-2 px-4 rounded-lg ${
                location.pathname === '/profile' 
                  ? "text-white bg-space-deep-purple/40 border-l-2 border-space-neon-blue" 
                  : "text-gray-300 hover:text-white hover:bg-space-deep-purple/30"
              } transition-all duration-300`}
            >
              Profile
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
