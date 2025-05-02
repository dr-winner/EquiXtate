
import React from 'react';
import { Building, Coins, Gavel, Home } from 'lucide-react';
import MobileNavLink from './MobileNavLink';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  mobileMenuOpen, 
  activeSection, 
  scrollToSection 
}) => {
  if (!mobileMenuOpen) return null;

  return (
    <div className="md:hidden glassmorphism mt-2 mx-4 py-4 px-2 rounded-lg border border-space-neon-purple/30 animate-fade-in">
      <div className="flex flex-col space-y-4 px-4">
        <MobileNavLink 
          href="home" 
          onClick={() => scrollToSection("home")}
          isActive={activeSection === "home"}
        >
          <Home className="w-4 h-4 mr-2" /> Home
        </MobileNavLink>
        <MobileNavLink 
          href="marketplace" 
          onClick={() => scrollToSection("marketplace")}
          isActive={activeSection === "marketplace"}
        >
          <Building className="w-4 h-4 mr-2" /> Marketplace
        </MobileNavLink>
        <MobileNavLink 
          href="properties" 
          onClick={() => scrollToSection("properties")}
          isActive={activeSection === "properties"}
        >
          <Building className="w-4 h-4 mr-2" /> Properties
        </MobileNavLink>
        <MobileNavLink 
          href="invest" 
          onClick={() => scrollToSection("invest")}
          isActive={activeSection === "invest"}
        >
          <Coins className="w-4 h-4 mr-2" /> Invest
        </MobileNavLink>
        <MobileNavLink 
          href="governance" 
          onClick={() => scrollToSection("governance")}
          isActive={activeSection === "governance"}
        >
          <Gavel className="w-4 h-4 mr-2" /> Governance
        </MobileNavLink>
      </div>
    </div>
  );
};

export default MobileMenu;
