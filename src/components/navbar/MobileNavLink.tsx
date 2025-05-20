
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, children, onClick, isActive: forcedActive }) => {
  const location = useLocation();
  const isActive = forcedActive !== undefined ? forcedActive : location.pathname === href;
  
  return (
    <Link
      to={href}
      onClick={(e) => {
        if (onClick) {
          onClick();
        }
      }}
      className={`font-spacegrotesk flex items-center py-2 px-4 rounded-lg ${
        isActive 
          ? "text-white bg-space-deep-purple/40 border-l-2 border-space-neon-blue" 
          : "text-gray-300 hover:text-white hover:bg-space-deep-purple/30"
      } transition-all duration-300`}
    >
      {children}
    </Link>
  );
};

export default MobileNavLink;
