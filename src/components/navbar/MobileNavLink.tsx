
import React from 'react';

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, children, onClick, isActive }) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`font-spacegrotesk flex items-center py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-space-neon-purple ${
        isActive 
          ? "text-white bg-space-neon-blue/80 border-l-2 border-space-neon-green" 
          : "text-space-neon-blue hover:text-white hover:bg-space-neon-blue/40"
      } transition-all duration-300`}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </a>
  );
};

export default MobileNavLink;
