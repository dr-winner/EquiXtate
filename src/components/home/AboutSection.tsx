
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, DollarSign, Percent, Users } from 'lucide-react';

const AboutSection: React.FC = () => {
  const features = [
    {
      icon: <DollarSign className="h-6 w-6 text-space-neon-green" />,
      title: "Fractional Ownership",
      description: "Invest in high-quality real estate with as little as $20 through tokenized property shares."
    },
    {
      icon: <Shield className="h-6 w-6 text-space-neon-blue" />,
      title: "Blockchain Security",
      description: "All transactions and ownership records are secured by blockchain technology for maximum transparency."
    },
    {
      icon: <Percent className="h-6 w-6 text-space-neon-purple" />,
      title: "Passive Income",
      description: "Earn rental income proportional to your ownership stake, distributed automatically via smart contracts."
    },
    {
      icon: <Users className="h-6 w-6 text-space-neon-green" />,
      title: "DAO Governance",
      description: "Participate in property decisions through decentralized governance based on token holdings."
    }
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-neon-gradient neon-glow-purple">
              Revolutionizing Real Estate Investment
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            EquiXtate makes real estate investment accessible to everyone through blockchain technology
            and fractional ownership. Our platform removes traditional barriers and democratizes access 
            to one of the world's oldest and most stable asset classes.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glassmorphism p-6 rounded-lg hover:bg-space-deep-purple/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-space-deep-purple/50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 p-6 glassmorphism rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">How EquiXtate Works</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-space-neon-green flex items-center justify-center mr-3 text-black font-bold">1</span>
                  <p className="text-gray-300">Properties are tokenized and divided into EquiX tokens valued at $2.00 each</p>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-space-neon-blue flex items-center justify-center mr-3 text-black font-bold">2</span>
                  <p className="text-gray-300">Investors purchase tokens representing fractional ownership of properties</p>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-space-neon-purple flex items-center justify-center mr-3 text-black font-bold">3</span>
                  <p className="text-gray-300">Rental income is distributed automatically to token holders via smart contracts</p>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-space-neon-green flex items-center justify-center mr-3 text-black font-bold">4</span>
                  <p className="text-gray-300">Token holders participate in governance decisions through DAO voting</p>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-neon-gradient rounded-lg blur-xl opacity-30"></div>
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80" 
                  alt="Modern Property" 
                  className="rounded-lg border border-space-neon-purple/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
