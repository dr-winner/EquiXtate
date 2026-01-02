import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuthenticationModal } from './use-authentication-modal';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook to integrate Privy authentication with the existing auth flow
 */
export const usePrivyAuth = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { closeModal: closeAuthModal } = useAuthenticationModal();

  // Handle authentication state changes
  useEffect(() => {
    if (ready && authenticated && user) {
      // User is authenticated via Privy
      const email = user.email?.address || user.google?.email || user.twitter?.email || 
                   user.discord?.email || user.github?.email || user.apple?.email;
      
      if (email) {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        
        // Dispatch event for other components
        const event = new Event('authStatusChanged');
        window.dispatchEvent(event);
        
        // Close auth modal if open
        closeAuthModal();
        
        toast({
          title: "Authentication Successful",
          description: `Welcome back, ${email}!`,
        });
      }
    } else if (ready && !authenticated) {
      // User is not authenticated
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
    }
  }, [ready, authenticated, user, closeAuthModal]);

  return {
    ready,
    authenticated,
    user,
    login,
    logout,
  };
};

