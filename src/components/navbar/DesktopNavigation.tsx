
import React from 'react';
import { Link } from 'react-router-dom';
import NavLink from './NavLink';

interface DesktopNavigationProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  activeSection,
  scrollToSection
}) => {
  return (
    <div className="hidden lg:flex items-center space-x-8">
      <NavLink
        href="/"
        isActive={activeSection === 'hero'}
        onClick={() => scrollToSection('hero')}
      >
        Home
      </NavLink>
      
      <NavLink
        href="/#marketplace"
        isActive={activeSection === 'marketplace'}
        onClick={() => scrollToSection('marketplace')}
      >
        Marketplace
      </NavLink>
      
      <NavLink
        href="/#tokenization"
        isActive={activeSection === 'tokenization'}
        onClick={() => scrollToSection('tokenization')}
      >
        Tokenization
      </NavLink>
      
      <NavLink
        href="/profile"
      >
        Profile
      </NavLink>
    </div>
  );
};

export default DesktopNavigation;
