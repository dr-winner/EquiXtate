import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import krnlLogo from '../../../assets/images/KRNL logo.webp';
import sonicLabsLogo from '../../../assets/images/Sonic Labs.webp';

const PartnersSection: React.FC = () => {
  // Partner logos data
  const partners = [
    {
      name: 'KRNL',
      logo: krnlLogo,
      url: 'https://www.krnl.tech/'
    },
    {
      name: 'Sonic Labs',
      logo: sonicLabsLogo,
      url: 'https://soniclabs.com/'
    }
  ];

  // Duplicate partners array for seamless infinite scroll (memoized)
  const duplicatedPartners = useMemo(
    () => [...partners, ...partners, ...partners, ...partners],
    []
  );

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="mb-12 text-center">
        <h2 className="ds-h2 mb-3">Trusted Partners</h2>
        <p className="ds-body text-muted-foreground max-w-2xl mx-auto">
          Building the future of real estate with leading blockchain infrastructure providers
        </p>
      </div>

      {/* Infinite scroll container */}
      <div className="relative">
        {/* Gradient masks for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-space-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-space-black to-transparent z-10 pointer-events-none" />

        {/* Scrolling logos */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-16 items-center"
            animate={{
              x: [0, -1000],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <a
                key={`${partner.name}-${index}`}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group"
              >
                <div className="glassmorphism p-6 rounded-lg hover:border-primary/30 transition-colors duration-300 w-48 h-32 flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-w-full max-h-full object-contain grayscale opacity-100"
                  />
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Optional: Add a subtle background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  );
};

export default PartnersSection;
