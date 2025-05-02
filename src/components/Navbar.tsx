
import React, { useState } from 'react';
import WalletConnection from './WalletConnection';
import { useScrollEffect } from './navbar/hooks/useScrollEffect';
import NavbarLogo from './navbar/NavbarLogo';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileMenuButton from './navbar/MobileMenuButton';
import MobileMenu from './navbar/MobileMenu';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrolled, activeSection } = useScrollEffect();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glassmorphism py-2' : 'py-4'
    }`}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <NavbarLogo />

        <DesktopNavigation 
          activeSection={activeSection}
          scrollToSection={scrollToSection}
        />

        <div className="flex items-center space-x-2">
          <WalletConnection />
          
          <MobileMenuButton 
            mobileMenuOpen={mobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
        </div>
      </div>

      <MobileMenu 
        mobileMenuOpen={mobileMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />
    </nav>
  );
};

export default Navbar;
