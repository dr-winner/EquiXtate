
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import MobileNavLink from './MobileNavLink';

interface FeaturedPropertyProps {
  id: string;
  title: string;
  location: string;
  price: number;
  // Add other properties as needed
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: { href: string; label: string }[];
  isAuthenticated: boolean;
  featuredProperties?: FeaturedPropertyProps[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  menuItems,
  isAuthenticated,
  featuredProperties,
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-space-black/95 flex flex-col overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: isOpen ? 1 : 0,
        height: isOpen ? '100%' : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-6 h-full flex flex-col">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-white hover:text-space-neon-blue transition-colors"
            aria-label="Close menu"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center space-y-8">
          {menuItems.map((item) => {
            // Skip the profile link if user is not authenticated
            if (item.href === '/profile' && !isAuthenticated) {
              return null;
            }
            
            return (
              <MobileNavLink
                key={item.href}
                href={item.href}
                onClick={onClose}
              >
                {item.label}
              </MobileNavLink>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
