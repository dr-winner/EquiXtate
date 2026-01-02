
import React from 'react';
import { Link } from 'react-router-dom';
import { User, History, HelpCircle, Settings, LogOut } from 'lucide-react';

interface WalletMenuItemsProps {
  setShowDropdown: (show: boolean) => void;
  disconnectWallet: () => void;
}

const WalletMenuItems: React.FC<WalletMenuItemsProps> = ({
  setShowDropdown,
  disconnectWallet
}) => {
  
  const menuItems: Array<{
    icon: React.ReactNode;
    label: string;
    path: string | null;
    isDisconnect?: boolean;
  }> = [
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
    },
    {
      icon: <LogOut className="h-4 w-4 mr-2 text-red-400" />,
      label: 'Disconnect',
      path: null,
      isDisconnect: true
    }
  ];

  return (
    <div className="space-y-2">
      {menuItems.map((item, index) => {
        if (item.isDisconnect) {
          return (
            <button
              key={index}
              type="button"
              className="w-full py-2 px-3 flex items-center bg-space-deep-purple/30 rounded-lg hover:bg-space-deep-purple/50 transition-colors text-left"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Disconnect clicked");
                
                // Close dropdown immediately
                setShowDropdown(false);
                
                // Call disconnect
                disconnectWallet();
              }}
            >
              {item.icon}
              <span className="text-red-400">{item.label}</span>
            </button>
          );
        }
        
        return (
          <Link
            key={index}
            to={item.path!}
            className="w-full py-2 px-3 flex items-center bg-space-deep-purple/30 rounded-lg hover:bg-space-deep-purple/50 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            {item.icon}
            <span className="text-white">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default WalletMenuItems;
