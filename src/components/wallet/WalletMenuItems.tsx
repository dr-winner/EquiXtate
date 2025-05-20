
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, History, HelpCircle, Settings, LogOut } from 'lucide-react';

interface WalletMenuItemsProps {
  setShowDropdown: (show: boolean) => void;
  disconnectWallet: () => void;
}

const WalletMenuItems: React.FC<WalletMenuItemsProps> = ({
  setShowDropdown,
  disconnectWallet
}) => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      icon: <User className="h-4 w-4 mr-2 text-space-neon-blue" />,
      label: 'My Profile',
      path: '/profile'
    },
    {
      icon: <History className="h-4 w-4 mr-2 text-space-neon-blue" />,
      label: 'Transaction History',
      path: '/transactions'
    },
    {
      icon: <Settings className="h-4 w-4 mr-2 text-space-neon-blue" />,
      label: 'Settings',
      path: '/settings'
    },
    {
      icon: <HelpCircle className="h-4 w-4 mr-2 text-space-neon-blue" />,
      label: 'Help Center',
      path: '/help'
    }
  ];

  return (
    <div className="space-y-2">
      {menuItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className="w-full py-2 px-3 flex items-center bg-space-deep-purple/30 rounded-lg hover:bg-space-deep-purple/50 transition-colors"
          onClick={() => setShowDropdown(false)}
        >
          {item.icon}
          <span className="text-white">{item.label}</span>
        </Link>
      ))}
      
      <button
        className="w-full py-2 px-3 flex items-center bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors mt-4"
        onClick={() => {
          disconnectWallet();
          // If we're on a protected route, navigate back to home
          if (['/profile', '/transactions', '/settings', '/help'].includes(window.location.pathname)) {
            navigate('/');
          }
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span>Disconnect</span>
      </button>
    </div>
  );
};

export default WalletMenuItems;
