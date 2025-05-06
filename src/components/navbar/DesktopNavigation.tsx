import React from 'react';
import NavLink from './NavLink';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FeaturedPropertyProps {
  // Define the interface based on the actual properties needed
  id: string;
  title: string;
  location: string;
  price: number;
  // Add other properties as needed
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isTransparent?: boolean;
}

interface DesktopNavigationProps {
  menuItems: { href: string; label: string }[];
  isTransparent: boolean;
  isAuthenticated: boolean;
  featuredProperties?: FeaturedPropertyProps[];
  customStyle?: string;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  menuItems,
  isTransparent,
  isAuthenticated,
  featuredProperties,
  customStyle,
}) => {
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    if (href === '/marketplace') {
      // Scroll to marketplace section
      const marketplaceSection = document.getElementById('marketplace');
      if (marketplaceSection) {
        marketplaceSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <nav
      className={`hidden md:flex items-center space-x-8 ${customStyle ? customStyle : ''}`}
    >
      {menuItems.map((item) => {
        // Skip the profile link if user is not authenticated
        if (item.href === '/profile' && !isAuthenticated) {
          return null;
        }
        
        return (
          <button
            key={item.href}
            onClick={() => handleNavClick(item.href)}
            className={`text-sm font-medium transition-colors ${
              isTransparent ? 'text-white hover:text-space-neon-blue' : 'text-gray-300 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default DesktopNavigation;
