// Environment Configuration Example
// Copy this file to env.ts and fill in your actual values

export const env = {
  // AI Service Configuration
  AI_API_BASE_URL: 'https://api.groq.com/openai/v1',
  AI_API_KEY: 'your_api_key_here',

  // Application Configuration
  API_BASE_URL: 'http://localhost:3000',
  APP_NAME: 'EquiXtate',
  APP_ENV: 'development',

  // Authentication
  AUTH0_DOMAIN: 'your_auth0_domain',
  AUTH0_CLIENT_ID: 'your_auth0_client_id',
  AUTH0_AUDIENCE: 'your_auth0_audience',
} as const;

// Type checking for environment variables
export type EnvConfig = typeof env; 