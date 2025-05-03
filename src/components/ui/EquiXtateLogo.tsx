
import React from 'react';
import { Diamond } from 'lucide-react';

interface EquiXtateLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'light' | 'dark';
}

const EquiXtateLogo: React.FC<EquiXtateLogoProps> = ({
  size = 'medium',
  variant = 'default'
}) => {
  // Size mapping
  const sizeClasses = {
    small: 'text-xl md:text-2xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl'
  };
  
  // Color mapping for the main text
  const textColorClasses = {
    default: 'text-transparent bg-clip-text bg-neon-gradient',
    light: 'text-white',
    dark: 'text-gray-800'
  };
  
  // Color mapping for the 'X' 
  const xColorClasses = {
    default: 'text-space-neon-blue',
    light: 'text-space-neon-blue',
    dark: 'text-space-neon-purple'
  };
  
  // Color mapping for the remaining text
  const remainingTextColorClasses = {
    default: 'text-white',
    light: 'text-gray-200',
    dark: 'text-gray-700'
  };
  
  return (
    <div className="flex items-center">
      <div className="flex items-center mr-2">
        <Diamond className={`h-6 w-6 md:h-7 md:w-7 text-space-neon-purple animate-pulse-glow`} />
      </div>
      <h1 className={`font-orbitron font-bold ${sizeClasses[size]} ${textColorClasses[variant]} neon-glow-purple`}>
        EQUI<span className={`${xColorClasses[variant]} font-bold`}>X</span><span className={`${remainingTextColorClasses[variant]}`}>TATE</span>
      </h1>
    </div>
  );
};

export default EquiXtateLogo;
