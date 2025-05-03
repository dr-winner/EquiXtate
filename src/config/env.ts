import { env as exampleEnv } from './env.example';

// Actual environment configuration
export const env = {
  ...exampleEnv,
  // Override with actual values from environment variables
  AI_API_BASE_URL: import.meta.env.VITE_AI_API_BASE_URL,
  AI_API_KEY: import.meta.env.VITE_AI_API_KEY,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_ENV: import.meta.env.VITE_APP_ENV,
  AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE,
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'AI_API_BASE_URL',
  'AI_API_KEY',
  'API_BASE_URL',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_AUDIENCE'
] as const;

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export type EnvConfig = typeof env; 