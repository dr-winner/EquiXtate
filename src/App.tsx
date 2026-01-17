import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiConfig } from 'wagmi'
import { config } from './config/wagmi'
import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_APP_ID, privyConfig } from './config/privy';
import { KRNLWrapper } from './providers/KRNLWrapper';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PropertyPage from "./pages/PropertyPage";
import UserProfile from "./pages/UserProfile";
import GovernancePage from "./pages/GovernancePage";
import AIAdvisorBubble from "./components/AIAdvisorBubble";
import PrivyAuthHandler from "./components/PrivyAuthHandler";
import { StarFieldProvider } from "./contexts/StarFieldContext";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching on window focus for better performance
      retry: 1, // Only retry failed queries once
    },
  },
});

const App = () => {
  // Gracefully stop rendering if Privy app ID is missing; avoids runtime crash from provider.
  if (!PRIVY_APP_ID) {
    return (
      <div className="min-h-screen bg-space-black text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Privy App ID Required</h1>
          <p className="text-sm text-gray-300">
            Add your Privy App ID to the .env file as VITE_PRIVY_APP_ID, then restart the dev server.
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <p>1) Open .env (or copy .env.example)</p>
            <p>2) Set VITE_PRIVY_APP_ID=&lt;your_app_id&gt;</p>
            <p>3) Restart: npm run dev</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={privyConfig}
      >
        <KRNLWrapper>
          <WagmiConfig config={config}>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <StarFieldProvider>
                  <Toaster />
                  <Sonner />
                <BrowserRouter>
                  <PrivyAuthHandler />
                  <AIAdvisorBubble />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/property/:id" element={<PropertyPage />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/governance" element={<GovernancePage />} />
                    <Route path="/transactions" element={<UserProfile />} />
                    <Route path="/settings" element={<UserProfile />} />
                    <Route path="/help" element={<UserProfile />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </StarFieldProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </WagmiConfig>
      </KRNLWrapper>
    </PrivyProvider>
    </ErrorBoundary>
  );
};

export default App;
