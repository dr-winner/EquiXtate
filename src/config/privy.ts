import type { PrivyClientConfig } from '@privy-io/react-auth';

// Get Privy App ID from environment variables
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';

// Privy configuration
export const privyConfig: PrivyClientConfig = {
  // Login methods to enable
  loginMethods: ['email', 'sms', 'google', 'twitter', 'discord', 'github', 'apple'],
  // Appearance customization
  appearance: {
    theme: 'dark',
    accentColor: '#8B5CF6', // space-neon-purple
    logo: '/images/equixtate-logo.png',
  },
  // Embedded wallet configuration
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  // Legal and privacy
  legal: {
    termsAndConditionsUrl: '/terms',
    privacyPolicyUrl: '/privacy',
  },
};

