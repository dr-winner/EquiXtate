
import React from 'react';
import { Link } from 'react-router-dom';
import EquiXtateLogo from '@/components/ui/EquiXtateLogo';

const NavbarLogo: React.FC = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center hover:opacity-80 transition-opacity"
      aria-label="Go to homepage"
    >
      <EquiXtateLogo size="medium" variant="default" showText={false} />
    </Link>
  );
};

export default NavbarLogo;
