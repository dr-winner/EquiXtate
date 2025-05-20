
import React from 'react';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-space-black/50 backdrop-blur-sm -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-2">
                <span className="relative w-5 h-5 bg-space-neon-purple rounded-full">
                  <span className="absolute inset-0 rounded-full bg-space-neon-purple animate-ping opacity-50"></span>
                </span>
              </div>
              <h2 className="text-xl font-orbitron font-bold bg-clip-text text-transparent bg-neon-gradient">
                EQUI<span className="text-space-neon-blue font-bold">X</span><span className="text-white">TATE</span>
              </h2>
            </div>
            <p className="text-gray-400 mb-6 font-inter">
              Revolutionizing real estate through blockchain technology. Own, trade, 
              and earn from properties across the cosmic marketplace.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Twitter className="h-5 w-5" />} />
              <SocialIcon icon={<Instagram className="h-5 w-5" />} />
              <SocialIcon icon={<Linkedin className="h-5 w-5" />} />
              <SocialIcon icon={<Github className="h-5 w-5" />} />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-orbitron font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/marketplace">Marketplace</FooterLink>
              <FooterLink to="/marketplace">Properties</FooterLink>
              <FooterLink to="/tokenization">How it works</FooterLink>
              <FooterLink to="/help">FAQ</FooterLink>
              <FooterLink to="/about">About us</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-orbitron font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <FooterLink to="/docs">Documentation</FooterLink>
              <FooterLink to="/whitepaper">Whitepaper</FooterLink>
              <FooterLink to="/tokenomics">Token Economics</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-orbitron font-semibold mb-4 text-white">Newsletter</h3>
            <p className="text-gray-400 mb-4 font-inter">
              Subscribe to receive updates about our latest properties and platform features.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-space-deep-purple/50 border border-space-neon-blue/30 rounded-lg py-2 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-space-neon-blue"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-space-neon-blue text-white rounded px-3 py-1 text-sm font-spacegrotesk hover:bg-space-neon-purple transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-space-deep-purple pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 font-inter text-sm text-center md:text-left mb-4 md:mb-0">
            © 2025 EquiXtate. All rights reserved. Powered by Sonic Lab.
          </p>
          <div className="flex space-x-4">
            <FooterLink to="/privacy" className="text-sm">Privacy Policy</FooterLink>
            <FooterLink to="/terms" className="text-sm">Terms of Service</FooterLink>
            <FooterLink to="/cookies" className="text-sm">Cookies Settings</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => {
  return (
    <a
      href="#"
      className="w-8 h-8 flex items-center justify-center rounded-full border border-space-neon-purple/50 text-gray-300 hover:text-white hover:border-space-neon-blue hover:bg-space-neon-blue/20 transition-all duration-300"
    >
      {icon}
    </a>
  );
};

const FooterLink: React.FC<{ to: string; children: React.ReactNode; className?: string }> = ({ to, children, className }) => {
  return (
    <li>
      <Link
        to={to}
        className={`text-gray-400 hover:text-space-neon-blue transition-colors duration-200 font-inter ${className || ''}`}
      >
        {children}
      </Link>
    </li>
  );
};

export default Footer;
