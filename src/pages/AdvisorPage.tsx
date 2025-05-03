
import React, { useState, useRef, useEffect } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AdvisorPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your EquiXtate AI financial advisor. How can I help you with real estate investing today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      content: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simulate AI response (In a real implementation, this would call an API)
      setTimeout(() => {
        // Get AI response based on user query
        const aiResponse = getAIResponse(input);
        
        setMessages(prev => [...prev, {
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        }]);
        setIsLoading(false);
      }, 1000);
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

  // Basic rule-based responses (would be replaced by an actual AI API call)
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

  return (
    <div className="min-h-screen bg-space-black text-white">
      <StarField />
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <MessageCircle className="w-6 h-6 mr-2 text-space-neon-blue" />
            <h1 className="text-3xl font-orbitron">AI Investment Advisor</h1>
          </div>
          
          <div className="glassmorphism neon-border-green p-6 rounded-lg mb-6">
            <p className="text-gray-300 mb-4">
              Ask questions about real estate investing, tokenization, market trends, or get personalized investment advice.
            </p>
            
            <div className="bg-space-deep-purple/30 rounded-lg p-4 h-[400px] mb-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${msg.isUser ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      msg.isUser
                        ? 'bg-space-neon-blue/20 text-white ml-auto'
                        : 'bg-space-deep-purple/50 text-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${msg.isUser ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                placeholder="Ask about real estate investing..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="resize-none bg-space-deep-purple/20 border-space-neon-blue/50 rounded-lg flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-space-neon-blue hover:bg-space-neon-blue/80 self-end"
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
          
          <div className="glassmorphism p-6 rounded-lg">
            <h2 className="text-xl font-orbitron mb-4">Popular Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Investment Strategies', 'Tokenization Benefits', 'Market Trends', 'Risk Management', 'Tax Implications', 'Beginner Tips'].map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  className="border-space-neon-blue/50 hover:bg-space-deep-purple/30 text-gray-300"
                  onClick={() => setInput(`Tell me about ${topic.toLowerCase()}`)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdvisorPage;
