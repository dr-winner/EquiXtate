
import React, { useState, useEffect } from 'react';
import { useScrollEffect } from './navbar/hooks/useScrollEffect';
import NavbarLogo from './navbar/NavbarLogo';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileMenuButton from './navbar/MobileMenuButton';
import MobileMenu from './navbar/MobileMenu';
import WalletConnection from './wallet/WalletConnection';
import AdminService from '@/services/AdminService';
import { Shield } from 'lucide-react';

interface FeaturedPropertyProps {
  id: string;
  title: string;
  location: string;
  price: number;
  // Add other properties as needed
}

interface NavbarProps {
  transparent?: boolean;
  featuredProperties?: FeaturedPropertyProps[];
}

const Navbar: React.FC<NavbarProps> = ({
  transparent = false,
  featuredProperties,
}) => {
  const { scrolled } = useScrollEffect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Menu items
  const [menuItems, setMenuItems] = useState([
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/governance', label: 'Governance' },
    { href: '/profile', label: 'Profile' },
  ]);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
    };

    checkAuth();

    // Check if user is admin
    const checkAdminStatus = async () => {
      const adminStatus = await AdminService.checkAdminAccess();
      setIsAdmin(adminStatus);
      
      // If admin, add admin link to menu if it doesn't exist
      if (adminStatus) {
        setMenuItems(prevItems => {
          const adminItem = { href: '/admin', label: 'Admin' };
          // Check if admin link already exists
          const adminExists = prevItems.some(item => item.href === '/admin');
          if (!adminExists) {
            return [...prevItems, adminItem];
          }
          return prevItems;
        });
      }
    };
    
    checkAdminStatus();

    // Listen for authentication status changes
    const handleAuthChange = () => {
      checkAuth();
      checkAdminStatus();
    };

    window.addEventListener('authStatusChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange);
    };
  }, []);

  // Navigation style classes
  const navClasses = transparent
    ? `fixed w-full top-0 z-40 transition-all duration-300 ${
        scrolled || isMenuOpen
          ? 'bg-space-black/80 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      }`
    : 'fixed top-0 w-full z-40 bg-space-black/80 backdrop-blur-sm shadow-lg transition-all duration-300';
    
  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className={navClasses}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <NavbarLogo />

          {/* Desktop Navigation */}
          <DesktopNavigation
            menuItems={menuItems}
            isTransparent={transparent && !scrolled}
            isAuthenticated={isAuthenticated}
            featuredProperties={featuredProperties}
          />

          {/* Wallet Connection */}
          <div className="flex items-center">
            {isAdmin && (
              <div className="mr-3 text-green-400 flex items-center" title="Admin Access">
                <Shield className="h-5 w-5" />
              </div>
            )}
            <WalletConnection />
            <MobileMenuButton
              isMenuOpen={isMenuOpen}
              toggleOpen={toggleMobileMenu}
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuItems={menuItems}
        isAuthenticated={isAuthenticated}
        featuredProperties={featuredProperties}
      />
    </>
  );
};

export default Navbar;
