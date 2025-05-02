
import React from 'react';
import { Building, Coins, Gavel, Home } from 'lucide-react';
import NavLink from './NavLink';

interface DesktopNavigationProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ 
  activeSection, 
  scrollToSection 
}) => {
  return (
    <div className="hidden md:flex space-x-8">
      <NavLink 
        href="home" 
        isActive={activeSection === "home"}
        onClick={() => scrollToSection("home")}
      >
        <Home className="w-4 h-4 mr-1" /> Home
      </NavLink>
      <NavLink 
        href="marketplace" 
        isActive={activeSection === "marketplace"}
        onClick={() => scrollToSection("marketplace")}
      >
        <Building className="w-4 h-4 mr-1" /> Marketplace
      </NavLink>
      <NavLink 
        href="properties" 
        isActive={activeSection === "properties"}
        onClick={() => scrollToSection("properties")}
      >
        <Building className="w-4 h-4 mr-1" /> Properties
      </NavLink>
      <NavLink 
        href="invest" 
        isActive={activeSection === "invest"}
        onClick={() => scrollToSection("invest")}
      >
        <Coins className="w-4 h-4 mr-1" /> Invest
      </NavLink>
      <NavLink 
        href="governance" 
        isActive={activeSection === "governance"}
        onClick={() => scrollToSection("governance")}
      >
        <Gavel className="w-4 h-4 mr-1" /> Governance
      </NavLink>
    </div>
  );
};

export default DesktopNavigation;
