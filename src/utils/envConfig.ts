
/**
 * Environment configuration utility for managing API keys
 * This allows us to access environment variables safely
 */

// Get the Groq API key from environment or use a default value for development
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

// Function to check if API key is available
export const isGroqApiKeyAvailable = (): boolean => {
  return !!GROQ_API_KEY && GROQ_API_KEY.length > 0;
};
