
/**
 * Environment configuration utility for managing API keys and service configs
 * This allows us to access environment variables safely
 */

// Get the Groq API key from environment or use a default value for development
// Trim whitespace in case there are accidental spaces
const rawApiKey = import.meta.env.VITE_GROQ_API_KEY || "";
export const GROQ_API_KEY = typeof rawApiKey === 'string' ? rawApiKey.trim() : "";

// KRNL Protocol Configuration
export const KRNL_CONFIG = {
  // RPC endpoint for KRNL provider
  rpcUrl: import.meta.env.VITE_RPC_KRNL || '',
  
  // KRNL Entry ID for verification services
  entryId: import.meta.env.VITE_KRNL_ENTRY_ID || '',
  
  // KRNL Access Token
  accessToken: import.meta.env.VITE_KRNL_ACCESS_TOKEN || '',
  
  // KRNL Kernel ID for property verification
  kernelId: import.meta.env.VITE_KRNL_KERNEL_ID || '1529',
  
  // Smart Contract Address for KRNL interactions
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
};

// Privy Configuration
export const PRIVY_CONFIG = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || '',
};

// WalletConnect Configuration
export const WALLETCONNECT_CONFIG = {
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
};

// Sumsub Configuration (KYC/AML Verification)
export const envConfig = {
  sumsubApiUrl: import.meta.env.VITE_SUMSUB_API_URL || 'https://api.sumsub.com',
  sumsubAppToken: import.meta.env.VITE_SUMSUB_APP_TOKEN || '',
  sumsubSecretKey: import.meta.env.VITE_SUMSUB_SECRET_KEY || '',
  sumsubSandboxMode: import.meta.env.VITE_SUMSUB_SANDBOX_MODE === 'true',
};

// KYC Verifier Contract Configuration
export const KYC_VERIFIER_CONFIG = {
  contractAddress: import.meta.env.VITE_KYC_VERIFIER_CONTRACT || '',
};

// Property Registry Contract Configuration
export const PROPERTY_REGISTRY_CONFIG = {
  contractAddress: import.meta.env.VITE_PROPERTY_REGISTRY_ADDRESS || '0xE11D19503029Ed7D059A0022288FB88d61C7c3b4',
};

// Function to check if API key is available
export const isGroqApiKeyAvailable = (): boolean => {
  const isAvailable = !!GROQ_API_KEY && GROQ_API_KEY.length > 0;
  
  // Check if it's still the placeholder
  const isPlaceholder = GROQ_API_KEY.includes('your_groq_api_key_here') || 
                        GROQ_API_KEY.includes('your_actual_api_key_here') ||
                        GROQ_API_KEY.length < 10;
  
  // Debug logging in development - always log to help with troubleshooting
  console.log('[envConfig] GROQ_API_KEY check:', {
    hasKey: !!GROQ_API_KEY,
    keyLength: GROQ_API_KEY.length,
    keyPreview: GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 8)}...` : 'empty',
    isPlaceholder,
    rawEnvValue: import.meta.env.VITE_GROQ_API_KEY ? 'present' : 'missing',
    rawEnvType: typeof import.meta.env.VITE_GROQ_API_KEY,
    isAvailable: isAvailable && !isPlaceholder,
    allEnvKeys: Object.keys(import.meta.env).filter(key => key.includes('GROQ') || key.includes('VITE'))
  });
  
  if (isPlaceholder && import.meta.env.DEV) {
    console.warn('⚠️ GROQ API Key is still set to placeholder value!');
    console.warn('📝 To fix this:');
    console.warn('   1. Get your API key from: https://console.groq.com/');
    console.warn('   2. Open the .env file in the project root');
    console.warn('   3. Replace "your_groq_api_key_here" with your actual API key');
    console.warn('   4. Restart the dev server (stop and run npm run dev again)');
  } else if (!isAvailable && import.meta.env.DEV) {
    console.warn('⚠️ GROQ API Key is missing!');
    console.warn('📝 To fix this:');
    console.warn('   1. Open the .env file in the project root');
    console.warn('   2. Add: VITE_GROQ_API_KEY=your_actual_api_key_here');
    console.warn('   3. Restart the dev server (stop and run npm run dev again)');
    console.warn('   4. Get your API key from: https://console.groq.com/');
  }
  
  return isAvailable && !isPlaceholder;
};

// Function to check if KRNL config is available
export const isKRNLConfigAvailable = (): boolean => {
  const hasRpcUrl = !!KRNL_CONFIG.rpcUrl && KRNL_CONFIG.rpcUrl.length > 0;
  const hasEntryId = !!KRNL_CONFIG.entryId && KRNL_CONFIG.entryId.length > 0;
  const hasAccessToken = !!KRNL_CONFIG.accessToken && KRNL_CONFIG.accessToken.length > 0;
  
  if (import.meta.env.DEV) {
    console.log('[envConfig] KRNL config check:', {
      hasRpcUrl,
      hasEntryId,
      hasAccessToken,
      rpcUrlPreview: KRNL_CONFIG.rpcUrl ? `${KRNL_CONFIG.rpcUrl.substring(0, 20)}...` : 'missing',
      entryIdPreview: KRNL_CONFIG.entryId || 'missing',
      kernelId: KRNL_CONFIG.kernelId
    });
    
    if (!hasRpcUrl || !hasEntryId || !hasAccessToken) {
      console.warn('⚠️ KRNL configuration incomplete! Running in mock mode.');
      console.warn('📝 Optional environment variables for production:');
      console.warn('   - VITE_RPC_KRNL (set to KRNL node RPC)');
      console.warn('   - VITE_KRNL_ENTRY_ID (from KRNL dashboard)');
      console.warn('   - VITE_KRNL_ACCESS_TOKEN (from KRNL dashboard)');
      console.warn('   - VITE_CONTRACT_ADDRESS (deployed contract)');
    }
  }
  
  return hasRpcUrl && hasEntryId && hasAccessToken;
};

// Function to validate all required environment variables
export const validateEnvironment = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!PRIVY_CONFIG.appId) {
    missing.push('VITE_PRIVY_APP_ID');
  }
  
  if (!WALLETCONNECT_CONFIG.projectId) {
    missing.push('VITE_WALLETCONNECT_PROJECT_ID');
  }
  
  if (!GROQ_API_KEY || GROQ_API_KEY.length < 10) {
    missing.push('VITE_GROQ_API_KEY');
  }
  
  if (!KRNL_CONFIG.rpcUrl) {
    missing.push('VITE_RPC_KRNL or NEXT_PUBLIC_RPC_KRNL');
  }
  
  if (!KRNL_CONFIG.entryId) {
    missing.push('VITE_KRNL_ENTRY_ID or NEXT_PUBLIC_ENTRY_ID');
  }
  
  if (!KRNL_CONFIG.accessToken) {
    missing.push('VITE_KRNL_ACCESS_TOKEN or NEXT_PUBLIC_ACCESS_TOKEN');
  }
  
  if (missing.length > 0 && import.meta.env.DEV) {
    console.warn('⚠️ Missing environment variables:', missing);
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
};

