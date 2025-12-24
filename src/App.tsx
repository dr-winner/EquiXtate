
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/config/rainbowkit';
import AIAdvisorBubble from "./components/AIAdvisorBubble";

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PropertyPage = lazy(() => import("./pages/PropertyPage"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching on window focus for better performance
      retry: 1, // Only retry failed queries once
    },
  },
});

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AIAdvisorBubble />
            <Suspense fallback={
              <div className="min-h-screen bg-space-black flex items-center justify-center">
                <div className="text-primary text-lg">Loading...</div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/property/:id" element={<PropertyPage />} />
                <Route path="/profile" element={<UserProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
