
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function useAIAdvisor() {
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
      // Call Groq API
      const response = await fetchGroqResponse(message);
      
      setMessages(prev => [...prev, {
        content: response,
        isUser: false,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI advisor. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Fetch response from Groq API
  const fetchGroqResponse = async (query: string): Promise<string> => {
    try {
      const API_KEY = "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";
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are an expert real estate investment advisor named EquiXtate Advisor. Provide helpful, concise advice about real estate investing, tokenization, market trends, and investment strategies. Focus on explaining concepts related to fractional ownership, property tokens, ROI calculations, and risk management in real estate. Keep responses informative but brief (100-150 words maximum)."
            },
            {
              role: "user", 
              content: query
            }
          ],
          temperature: 0.5,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Groq API:", error);
      // Fallback to rule-based responses if API fails
      return getAIResponse(query);
    }
  };

  // Fallback rule-based responses (only used if API fails)
  const getAIResponse = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery.includes('invest') || lowercaseQuery.includes('investment')) {
      return "When considering real estate investments, focus on location, property condition, market trends, and potential ROI. Tokenized real estate on EquiXtate offers lower entry barriers and greater liquidity compared to traditional investments.";
    } else if (lowercaseQuery.includes('token') || lowercaseQuery.includes('tokenization')) {
      return "Real estate tokenization divides property ownership into digital tokens on the blockchain. This allows for fractional ownership, increased liquidity, and lower investment thresholds. Each token represents partial ownership of the underlying asset.";
    } else if (lowercaseQuery.includes('risk') || lowercaseQuery.includes('risks')) {
      return "Real estate investments carry several risks: market fluctuations, property damage, regulatory changes, and liquidity constraints. Diversification across multiple properties or tokens can help mitigate these risks.";
    } else if (lowercaseQuery.includes('return') || lowercaseQuery.includes('roi') || lowercaseQuery.includes('profit')) {
      return "Real estate returns come from property value appreciation and rental income. Typically, annual ROI ranges from 5-10% depending on location and property type. Tokenized properties on EquiXtate have historically performed within this range.";
    } else if (lowercaseQuery.includes('tax') || lowercaseQuery.includes('taxes')) {
      return "Real estate investments have several tax implications including property taxes, income tax on rental income, and capital gains tax when selling. Please consult with a tax professional for advice specific to your situation.";
    } else if (lowercaseQuery.includes('beginner') || lowercaseQuery.includes('start')) {
      return "For beginners, I recommend starting with fractional ownership through our tokenized properties. Begin with a small investment across multiple properties to diversify risk. Research neighborhoods with growth potential and properties with strong rental demand.";
    }
    
    return "Thank you for your question. To provide more specific advice about real estate investments, could you please elaborate or ask about particular aspects like tokenization benefits, risk management, ROI expectations, or investment strategies?";
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage
  };
}
