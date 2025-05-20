
import React, { useRef, useEffect } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';
import { useAIAdvisor } from '@/hooks/useAIAdvisor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isGroqApiKeyAvailable } from '@/utils/envConfig';

const AdvisorPage: React.FC = () => {
  const { messages, input, setInput, isLoading, handleSendMessage } = useAIAdvisor();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };
  
  // Add keyboard event handler for Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSendMessage(input);
      }
    }
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
          
          {!isGroqApiKeyAvailable() && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Key Missing</AlertTitle>
              <AlertDescription>
                Please add your GROQ API key in a <code>.env</code> file (VITE_GROQ_API_KEY=your_key_here) to use the AI advisor with real LLM responses.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="glassmorphism neon-border-green p-6 rounded-lg mb-6">
            <p className="text-gray-300 mb-4">
              Ask questions about real estate investing, tokenization, market trends, or get personalized investment advice.
              {isGroqApiKeyAvailable() && <span className="ml-1 text-space-neon-green">(Using Llama 3 via Groq API)</span>}
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
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                placeholder="Ask about real estate investing..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none bg-space-deep-purple/20 border-space-neon-blue/50 rounded-lg flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-space-neon-blue hover:bg-space-neon-blue/80 self-end"
              >
                <Send size={18} />
                {isLoading && <span className="ml-2">Processing...</span>}
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
