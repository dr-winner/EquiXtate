import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiConfig } from 'wagmi'
import { config } from './config/wagmi'
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PropertyPage from "./pages/PropertyPage";
import UserProfile from "./pages/UserProfile";
import GovernancePage from "./pages/GovernancePage";
import AdminPage from "./pages/AdminPage";
import AIAdvisorBubble from "./components/AIAdvisorBubble";
import { StarFieldProvider } from "./contexts/StarFieldContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching on window focus for better performance
      retry: 1, // Only retry failed queries once
    },
  },
});

const App = () => (
  <WagmiConfig config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StarFieldProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AIAdvisorBubble />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/property/:id" element={<PropertyPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/governance" element={<GovernancePage />} />
              <Route path="/admin" element={<AdminPage />} />
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
);

export default App;
