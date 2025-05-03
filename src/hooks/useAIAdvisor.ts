import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import AIProxyService from '@/services/ai/AIProxyService';
import { useAuth } from '@/hooks/useAuth';

export interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function useAIAdvisor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your EquiXtate AI financial advisor. How can I help you with real estate investing today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the AI advisor.",
        variant: "destructive",
      });
      return;
    }
    
    // Add user message
    const userMessage = {
      content: message,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await AIProxyService.getAIResponse(message, user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMessages(prev => [...prev, {
        content: response.response,
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get a response from the AI advisor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage
  };
}
