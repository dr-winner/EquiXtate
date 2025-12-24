
import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useScrollEffect } from './navbar/hooks/useScrollEffect';
import NavbarLogo from './navbar/NavbarLogo';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileMenuButton from './navbar/MobileMenuButton';
import MobileMenu from './navbar/MobileMenu';
import PageContainer from '@/components/layout/PageContainer';

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-colors duration-200 ${
        scrolled ? 'bg-background/80 border-b border-border/40 shadow-sm' : 'bg-transparent'
      }`}
    >
      <PageContainer padded width="wide" className="h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavbarLogo />
          <DesktopNavigation
            activeSection={activeSection}
            scrollToSection={scrollToSection}
          />
        </div>
        <div className="flex items-center gap-3">
          <ConnectButton />
          <MobileMenuButton
            mobileMenuOpen={mobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
        </div>
      </PageContainer>
      <MobileMenu
        mobileMenuOpen={mobileMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />
    </nav>
  );
};

export default Navbar;
