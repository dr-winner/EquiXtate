
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isTransparent?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  children,
  isTransparent = false 
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  const baseClasses = "relative font-medium transition-colors duration-300";
  const transparentClasses = isTransparent 
    ? "text-white hover:text-space-neon-blue" 
    : "text-gray-300 hover:text-space-neon-blue";
  
  const activeClasses = isActive 
    ? "text-space-neon-blue" 
    : transparentClasses;

  return (
    <Link to={href} className={`${baseClasses} ${activeClasses}`}>
      <span className="relative">
        {children}
        {isActive && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-space-neon-blue rounded-full"></span>
        )}
      </span>
    </Link>
  );
};

export default NavLink;
