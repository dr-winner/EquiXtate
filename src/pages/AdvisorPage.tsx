
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
                    className={`p-4 rounded-lg ${
                      msg.isUser
                        ? 'bg-space-neon-blue/20 text-white ml-auto'
                        : 'bg-space-deep-purple/50 text-gray-100'
                    }`}
                  >
                    {msg.isUser ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm space-y-1 prose prose-invert max-w-none">
                        {msg.content.split('\n').map((line, lineIndex) => {
                          const trimmed = line.trim();
                          if (trimmed.startsWith('### ')) {
                            return (
                              <h3 key={lineIndex} className="text-base font-semibold text-space-neon-blue mt-3 mb-2">
                                {trimmed.substring(4)}
                              </h3>
                            );
                          } else if (trimmed.startsWith('## ')) {
                            return (
                              <h2 key={lineIndex} className="text-lg font-bold text-space-neon-purple mt-4 mb-2">
                                {trimmed.substring(3)}
                              </h2>
                            );
                          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                            return (
                              <p key={lineIndex} className="ml-4 list-disc list-inside">
                                • {trimmed.substring(2)}
                              </p>
                            );
                          } else if (/^\d+\.\s/.test(trimmed)) {
                            return (
                              <p key={lineIndex} className="ml-4">
                                {trimmed}
                              </p>
                            );
                          } else if (trimmed === '') {
                            return <br key={lineIndex} />;
                          } else {
                            const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
                            return (
                              <p key={lineIndex} className="text-sm leading-relaxed mb-2">
                                {parts.map((part, partIndex) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong key={partIndex} className="font-semibold text-space-neon-blue">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          }
                        })}
                      </div>
                    )}
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
