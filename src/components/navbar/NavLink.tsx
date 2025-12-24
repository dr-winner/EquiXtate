
import React from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, isActive, onClick }) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`font-spacegrotesk flex items-center focus:outline-none focus:ring-2 focus:ring-space-neon-purple ${
        isActive 
          ? "text-white relative overflow-hidden group transition-all duration-300" 
          : "text-space-neon-blue hover:text-white relative overflow-hidden group transition-all duration-300"
      }`}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      <span className="flex items-center">{children}</span>
      <span className={`absolute bottom-0 left-0 h-0.5 bg-space-neon-green transition-all duration-300 ${
        isActive ? "w-full" : "w-0 group-hover:w-full"
      }`}></span>
    </a>
  );
};

export default NavLink;
