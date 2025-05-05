
import React from 'react';
import NavLink from './NavLink';
import { Button } from '@/components/ui/button';

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
          <NavLink
            key={item.href}
            href={item.href}
            isTransparent={isTransparent}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default DesktopNavigation;
