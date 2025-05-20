
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { GROQ_API_KEY, isGroqApiKeyAvailable } from '@/utils/envConfig';

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
      if (!isGroqApiKeyAvailable()) {
        toast({
          title: "API Key Missing",
          description: "Please add your GROQ API key in the .env file to access the AI advisor.",
          variant: "destructive",
        });
        console.error("Missing GROQ API key. Add VITE_GROQ_API_KEY to your .env file");
        
        // Still add a response so the UI doesn't hang
        setMessages(prev => [...prev, {
          content: "I'm unable to provide real AI assistance because the GROQ API key is missing. Please check the console for instructions on how to add your API key.",
          isUser: false,
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }
      
      // Call Groq API
      const response = await fetchGroqResponse(message);
      
      setMessages(prev => [...prev, {
        content: response,
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to get a response from the AI advisor. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        content: "I encountered an error while processing your request. This might be due to an issue with the API connection. Please try again later.",
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch response from Groq API
  const fetchGroqResponse = async (query: string): Promise<string> => {
    // Build context from previous messages for better continuity
    const contextMessages = messages.slice(-4).map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content
    }));
    
    console.log("Calling Groq API with GROQ_API_KEY:", GROQ_API_KEY ? "Key available" : "Key missing");
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are an expert real estate investment advisor named EquiXtate Advisor specializing in tokenized real estate and blockchain-based property investments.
            
Provide detailed, accurate, and specific advice about:
- Real estate tokenization mechanisms and benefits
- Fractional ownership structures in real estate
- Blockchain applications in property markets
- Token economics for real estate assets
- Regulatory considerations for tokenized properties
- Investment strategies specific to digital real estate assets
- Market trend analysis with data-driven insights
- Risk assessment for different tokenization models

Use concrete examples, specific numbers when appropriate, and reference real-world applications. Avoid generic advice. Your responses should be informative but concise (150-200 words maximum).`
          },
          ...contextMessages,
          {
            role: "user", 
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API Error:", errorData);
      throw new Error(
        `API request failed with status ${response.status}: ${
          errorData?.error?.message || "Unknown error"
        }`
      );
    }
    
    try {
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error parsing Groq API response:", error);
      throw new Error("Failed to parse the API response");
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
