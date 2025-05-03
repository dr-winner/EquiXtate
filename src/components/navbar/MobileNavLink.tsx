
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
      className={`font-spacegrotesk flex items-center py-2 px-4 rounded-lg ${
        isActive 
          ? "text-white bg-space-deep-purple/40 border-l-2 border-space-neon-blue" 
          : "text-gray-300 hover:text-white hover:bg-space-deep-purple/30"
      } transition-all duration-300`}
    >
      {children}
    </a>
  );
};

export default MobileNavLink;
