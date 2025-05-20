
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'light' | 'dark';
}

const EquiXtateLogo: React.FC<LogoProps> = ({ 
  size = 'medium',
  variant = 'default'
}) => {
  // Size mapping
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-12'
  };
  
  // Variant color mapping
  const colorClasses = {
    default: 'text-space-neon-purple',
    light: 'text-white',
    dark: 'text-gray-800'
  };
  
  // Background color for the Ex logo
  const bgColor = variant === 'default' 
    ? 'bg-space-neon-purple'
    : variant === 'light'
      ? 'bg-white'
      : 'bg-gray-800';
  
  // Text color for the Ex logo
  const textColor = variant === 'default'
    ? 'text-black'
    : variant === 'light'
      ? 'text-gray-800'
      : 'text-white';
  
  return (
    <div className="flex items-center">
      {/* Logo mark */}
      <div className={`${bgColor} p-1.5 rounded-lg mr-2`}>
        <span className={`font-orbitron font-bold ${textColor}`}>
          Ex
        </span>
      </div>
      
      {/* Logo text */}
      <div className={`font-orbitron font-bold ${colorClasses[variant]} ${sizeClasses[size]}`}>
        EquiXtate
      </div>
    </div>
  );
};

export default EquiXtateLogo;
