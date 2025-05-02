
import React from 'react';
import { Diamond } from 'lucide-react';

const NavbarLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="flex items-center mr-3">
        <Diamond className="h-7 w-7 text-space-neon-purple animate-pulse-glow" />
      </div>
      <h1 className="text-xl md:text-2xl font-orbitron font-bold bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
        EQUI<span className="text-space-neon-blue font-bold">X</span><span className="text-white">TATE</span>
      </h1>
    </div>
  );
};

export default NavbarLogo;
