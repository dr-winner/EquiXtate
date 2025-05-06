import React, { useEffect, useRef } from 'react';

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Star properties
    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const cryptoSymbols: CryptoSymbol[] = [];
    const numStars = Math.floor(canvas.width * canvas.height / 20000); // Reduced density
    
    interface Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
      cyclePosition: number;
    }
    
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      trail: Array<{x: number, y: number}>;
      active: boolean;
      timeToLive: number;
    }
    
    interface CryptoSymbol {
      x: number;
      y: number;
      symbol: string;
      opacity: number;
      size: number;
      speed: number;
      rotation: number;
      rotationSpeed: number;
      blur: number;
      color: string;
    }
    
    // Crypto symbols to display
    const symbols = ['₿', 'Ξ', '◎', '₳', 'Ł', '₮', '✕', 'Ð'];
    const colors = ['#9b87f5', '#33C3F0', '#00f5d4', '#F97316'];
    
    // Generate stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2, // Reduced max size
        opacity: Math.random() * 0.8, // Reduced max opacity
        speed: 0.1 + Math.random() * 0.2, // Reduced speed
        cyclePosition: Math.random() * 2 * Math.PI
      });
    }
    
    // Generate crypto symbols
    for (let i = 0; i < 15; i++) {
      cryptoSymbols.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        opacity: 0.05 + Math.random() * 0.15,
        size: 20 + Math.random() * 40,
        speed: 0.2 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        blur: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    // Shooting star creation
    const createShootingStar = (): ShootingStar => {
      return {
        x: Math.random() * canvas.width * 0.2,
        y: Math.random() * canvas.height * 0.5,
        length: 80 + Math.random() * 50,
        speed: 10 + Math.random() * 10,
        angle: Math.PI / 4 + (Math.random() * Math.PI / 4),
        opacity: 1,
        trail: [],
        active: true,
        timeToLive: 100 + Math.random() * 100
      };
    };
    
    // Animation
    let animationFrameId: number;
    let frameCount = 0;
    let lastFrameTime = performance.now();
    const targetFPS = 30; // Limit to 30 FPS
    const frameInterval = 1000 / targetFPS;
    
    const draw = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;
      
      if (elapsed > frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw blurred crypto symbols
        cryptoSymbols.forEach(symbol => {
          ctx.save();
          ctx.translate(symbol.x, symbol.y);
          ctx.rotate(symbol.rotation);
          
          // Apply blur effect
          ctx.filter = `blur(${symbol.blur}px)`;
          ctx.font = `${symbol.size}px Arial`;
          ctx.fillStyle = `${symbol.color}${Math.floor(symbol.opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(symbol.symbol, 0, 0);
          
          // Update position and rotation
          symbol.rotation += symbol.rotationSpeed;
          symbol.y += symbol.speed;
          symbol.x += Math.sin(frameCount / 100) * 0.3;
          
          // Reset if off screen
          if (symbol.y > canvas.height + symbol.size) {
            symbol.y = -symbol.size;
            symbol.x = Math.random() * canvas.width;
          }
          
          ctx.restore();
        });
        
        // Draw stars with twinkling effect
        stars.forEach(star => {
          star.cyclePosition += star.speed / 100;
          const flickerOpacity = star.opacity * (0.7 + 0.3 * Math.sin(star.cyclePosition));
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flickerOpacity})`;
          ctx.fill();
        });
        
        // Handle shooting stars
        if (frameCount % 100 === 0 && Math.random() > 0.7) {
          shootingStars.push(createShootingStar());
        }
        
        shootingStars.forEach(star => {
          if (!star.active) return;
          
          star.timeToLive -= 1;
          if (star.timeToLive <= 0) {
            star.active = false;
            return;
          }
          
          // Update position
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          
          // Add to trail
          star.trail.push({x: star.x, y: star.y});
          if (star.trail.length > 20) star.trail.shift();
          
          // Draw trail
          ctx.beginPath();
          ctx.moveTo(star.trail[0].x, star.trail[0].y);
          star.trail.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          
          const gradient = ctx.createLinearGradient(
            star.trail[0].x, star.trail[0].y,
            star.x, star.y
          );
          gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
          gradient.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Remove if off screen
          if (star.x > canvas.width || star.y > canvas.height) {
            star.active = false;
          }
        });
        
        // Clean up inactive shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          if (!shootingStars[i].active) {
            shootingStars.splice(i, 1);
          }
        }
        
        lastFrameTime = currentTime;
        frameCount++;
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    animationFrameId = requestAnimationFrame(draw);
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default StarField;
