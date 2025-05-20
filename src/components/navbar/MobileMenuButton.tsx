
import React from 'react';
import { Menu } from 'lucide-react';

interface MobileMenuButtonProps {
  isMenuOpen: boolean;
  toggleOpen: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isMenuOpen,
  toggleOpen,
}) => {
  return (
    <button
      className="ml-4 md:hidden text-white hover:text-space-neon-blue transition-colors"
      onClick={toggleOpen}
      aria-label={isMenuOpen ? "Close menu" : "Open menu"}
    >
      <Menu className="h-6 w-6" />
    </button>
  );
};

export default MobileMenuButton;
