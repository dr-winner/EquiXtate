
import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ mobileMenuOpen, toggleMobileMenu }) => {
  return (
    <button 
      className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-space-deep-purple/50 transition-colors"
      onClick={toggleMobileMenu}
      aria-label="Toggle menu"
    >
      {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
};

export default MobileMenuButton;
