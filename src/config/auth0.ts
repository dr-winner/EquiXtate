import { Auth0Provider } from '@auth0/auth0-react';
import { env } from './env';

interface Auth0ProviderWithNavigateProps {
  children: React.ReactNode;
}

export const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
  const domain = env.AUTH0_DOMAIN;
  const clientId = env.AUTH0_CLIENT_ID;
  const audience = env.AUTH0_AUDIENCE;

  if (!domain || !clientId || !audience) {
    throw new Error('Auth0 configuration is missing. Please check your environment variables.');
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
}; 