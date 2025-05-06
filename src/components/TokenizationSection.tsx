import React from 'react';
import { motion } from 'framer-motion';
import { Building, Coins, Users, Lock, Banknote } from 'lucide-react';

const TokenizationSection: React.FC = () => {
  const steps = [
    {
      icon: <Building className="h-10 w-10 text-space-neon-green" />,
      title: 'Property Verification',
      description: 'Real estate assets undergo legal verification and blockchain authentication',
    },
    {
      icon: <Coins className="h-10 w-10 text-space-neon-purple" />,
      title: 'Token Generation',
      description: 'Properties are tokenized with ERC-1155 standards for fractional ownership',
    },
    {
      icon: <Users className="h-10 w-10 text-space-neon-blue" />,
      title: 'Token Distribution',
      description: 'Property ownership tokens become available for investment and trading',
    },
    {
      icon: <Lock className="h-10 w-10 text-space-bright-orange" />,
      title: 'Blockchain Security',
      description: 'Ownership and transactions secured by immutable blockchain technology',
    }
  ];

  return (
    <section id="tokenization" className="py-20 relative">
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-space-neon-purple/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-space-neon-blue/10 blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold mb-4">
            <span className="text-white">Property </span>
            <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">Tokenization</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-inter">
            We transform physical real estate into blockchain tokens, creating liquid assets
            that can be traded with the security of smart contracts and decentralized technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="glassmorphism p-6 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-space-neon-purple/20 to-space-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-space-deep-purple/50 p-4 inline-flex rounded-lg mb-4 group-hover:shadow-neon-purple transition-all duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-orbitron font-semibold mb-2 text-white">
                  {step.title}
                </h3>
                <p className="text-gray-300 font-inter">
                  {step.description}
                </p>
              </div>
              <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-space-black/40 border border-space-neon-purple/30 text-space-neon-purple font-orbitron">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <div className="glassmorphism p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <h3 className="text-2xl md:text-3xl font-orbitron font-bold mb-4 text-white">
                  Unlock the Power of <span className="text-space-neon-green neon-glow-green">Tokenized</span> Ownership
                </h3>
                <p className="text-gray-300 mb-6 font-inter">
                  Own tokens representing premium real estate without traditional barriers.
                  Our platform leverages blockchain technology to make property investment accessible and liquid.
                </p>
                <ul className="space-y-3">
                  {[
                    'Purchase property tokens from $250',
                    'Instant liquidity through decentralized exchanges',
                    'Immutable blockchain ownership records',
                    'Smart contract rental income distribution',
                    'DAO-based governance for property decisions'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-200 font-inter">
                      <span className="w-2 h-2 bg-space-neon-purple rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-space-neon-purple/30 rounded-lg blur-xl"></div>
                  <img
                    src="https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=600&h=400&fit=crop"
                    alt="Blockchain Real Estate Tokenization"
                    className="w-full h-auto relative z-10 rounded-lg border border-space-neon-purple/50"
                  />
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-space-neon-green/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-space-neon-blue/20 rounded-full blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenizationSection;
