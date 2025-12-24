
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavLink from './NavLink';

interface DesktopNavigationProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  activeSection,
  scrollToSection
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="hidden lg:flex items-center space-x-8">
      {isHomePage ? (
        <>
          <NavLink
            href="#hero"
            isActive={activeSection === 'hero'}
            onClick={() => scrollToSection('hero')}
          >
            Home
          </NavLink>
          
          <NavLink
            href="#marketplace"
            isActive={activeSection === 'marketplace'}
            onClick={() => scrollToSection('marketplace')}
          >
            Marketplace
          </NavLink>
          
          <NavLink
            href="#tokenization"
            isActive={activeSection === 'tokenization'}
            onClick={() => scrollToSection('tokenization')}
          >
            Tokenization
          </NavLink>
        </>
      ) : (
        // If not on home page, use regular links without scroll behavior
        <Link
          to="/"
          className="font-spacegrotesk text-space-neon-blue hover:text-white relative overflow-hidden group transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-space-neon-purple"
          aria-label="Home"
        >
          <span className="flex items-center">Home</span>
          <span className="absolute bottom-0 left-0 h-0.5 bg-space-neon-green transition-all duration-300 w-0 group-hover:w-full"></span>
        </Link>
      )}
      
      <Link 
        to="/profile" 
        className={`font-spacegrotesk ${location.pathname === '/profile' ? 'text-white' : 'text-space-neon-blue hover:text-white'} relative overflow-hidden group transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-space-neon-purple`}
        aria-label="Profile"
      >
        <span className="flex items-center">Profile</span>
        <span className={`absolute bottom-0 left-0 h-0.5 bg-space-neon-green transition-all duration-300 ${location.pathname === '/profile' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
      </Link>
    </div>
  );
};

export default DesktopNavigation;
