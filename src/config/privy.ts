// Get Privy App ID from environment variables
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';

// Privy configuration
export const privyConfig = {
  // Login methods to enable
  loginMethods: ['email', 'sms', 'google', 'twitter', 'discord', 'github', 'apple'],
  // Appearance customization
  appearance: {
    theme: 'dark' as const,
    accentColor: '#8B5CF6', // space-neon-purple
    logo: '/images/equixtate-logo.png',
  },
  // Embedded wallet configuration
  embeddedWallets: {
    createOnLogin: 'users-without-wallets' as const,
  },
  // Legal and privacy
  legal: {
    termsAndConditionsUrl: '/terms',
    privacyPolicyUrl: '/privacy',
  },
};

