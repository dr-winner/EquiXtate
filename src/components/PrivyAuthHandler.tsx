import { useEffect } from 'react';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';

/**
 * Component to handle Privy authentication state changes
 * This should be rendered at the app level to sync Privy auth with the app state
 */
const PrivyAuthHandler: React.FC = () => {
  usePrivyAuth();
  
  // This component doesn't render anything, it just handles side effects
  return null;
};

export default PrivyAuthHandler;

