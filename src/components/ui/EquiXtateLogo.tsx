
import React from 'react';

interface EquiXtateLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'light' | 'dark';
  showText?: boolean;
}

const EquiXtateLogo: React.FC<EquiXtateLogoProps> = ({
  size = 'medium',
  variant = 'default',
  showText = true
}) => {
  // Size mapping for the logo image
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-16 w-16'
  };

  // Size mapping for text
  const textSizeClasses = {
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
      {/* Logo Image - Buildings and Houses */}
      <div className={`${sizeClasses[size]} mr-2 flex-shrink-0`}>
        <img
          src="/images/equixtate-logo.png"
          alt="EquiXtate Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to SVG if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        {/* Fallback SVG - will show if image doesn't exist */}
        <svg
          viewBox="0 0 200 150"
          className="w-full h-full hidden"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'none' }}
        >
          {/* Background */}
          <rect width="200" height="150" fill="#000000" />
          
          {/* Tallest Building (Center-Right, Purple) */}
          <g>
            {/* Main building structure */}
            <polygon
              points="140,80 140,30 160,30 160,80"
              fill="#A855F7"
              stroke="#7C3AED"
              strokeWidth="1"
            />
            {/* Windows grid */}
            {[0, 1, 2, 3].map((col) =>
              [0, 1, 2, 3, 4].map((row) => (
                <rect
                  key={`${col}-${row}`}
                  x={142 + col * 4.5}
                  y={35 + row * 9}
                  width="3"
                  height="6"
                  fill="#7C3AED"
                />
              ))
            )}
          </g>

          {/* Left Building (Cyan) */}
          <g>
            <polygon
              points="60,90 60,50 100,50 100,90"
              fill="#06B6D4"
              stroke="#0891B2"
              strokeWidth="1"
            />
            {/* Horizontal lines for floors */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="60"
                y1={55 + i * 9}
                x2="100"
                y2={55 + i * 9}
                stroke="#0891B2"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Right Building (Cyan) */}
          <g>
            <polygon
              points="170,100 170,60 195,60 195,100"
              fill="#06B6D4"
              stroke="#0891B2"
              strokeWidth="1"
            />
            {/* Horizontal and vertical lines */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={`h-${i}`}
                x1="170"
                y1={65 + i * 9}
                x2="195"
                y2={65 + i * 9}
                stroke="#0891B2"
                strokeWidth="1"
              />
            ))}
            {[0, 1].map((i) => (
              <line
                key={`v-${i}`}
                x1={170 + i * 12.5}
                y1="60"
                x2={170 + i * 12.5}
                y2="100"
                stroke="#0891B2"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Left House (Purple Roof) */}
          <g>
            {/* Roof */}
            <polygon
              points="40,110 20,130 60,130"
              fill="#A855F7"
              stroke="#7C3AED"
              strokeWidth="1"
            />
            {/* Dormer window */}
            <rect
              x="35"
              y="115"
              width="10"
              height="10"
              fill="#7C3AED"
            />
            <line x1="35" y1="120" x2="45" y2="120" stroke="#000" strokeWidth="0.5" />
            <line x1="40" y1="115" x2="40" y2="125" stroke="#000" strokeWidth="0.5" />
          </g>

          {/* Middle House (Cyan Roof) */}
          <g>
            {/* Roof */}
            <polygon
              points="110,120 90,140 130,140"
              fill="#06B6D4"
              stroke="#0891B2"
              strokeWidth="1"
            />
            {/* Chimney */}
            <rect
              x="115"
              y="110"
              width="6"
              height="15"
              fill="#0891B2"
            />
          </g>

          {/* Right House (Purple Roof) */}
          <g>
            {/* Roof */}
            <polygon
              points="150,110 130,130 170,130"
              fill="#A855F7"
              stroke="#7C3AED"
              strokeWidth="1"
            />
            {/* Dormer window */}
            <rect
              x="145"
              y="115"
              width="10"
              height="10"
              fill="#7C3AED"
            />
            <line x1="145" y1="120" x2="155" y2="120" stroke="#000" strokeWidth="0.5" />
            <line x1="150" y1="115" x2="150" y2="125" stroke="#000" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
      
      {/* Logo text */}
      {showText && (
        <h1 className={`font-orbitron font-bold ${textSizeClasses[size]} ${textColorClasses[variant]} neon-glow-purple`}>
          EQUI<span className={`${xColorClasses[variant]} font-bold`}>X</span><span className={`${remainingTextColorClasses[variant]}`}>TATE</span>
        </h1>
      )}
    </div>
  );
};

export default EquiXtateLogo;
