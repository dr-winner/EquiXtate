
/**
 * Environment configuration utility for managing API keys
 * This allows us to access environment variables safely
 */

// Get the Groq API key from environment or use a default value for development
// Trim whitespace in case there are accidental spaces
const rawApiKey = import.meta.env.VITE_GROQ_API_KEY || "";
export const GROQ_API_KEY = typeof rawApiKey === 'string' ? rawApiKey.trim() : "";

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
