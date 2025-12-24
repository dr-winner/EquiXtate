
import React, { useRef, useEffect } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/layout/Section';
import PageContainer from '@/components/layout/PageContainer';
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

  return (
    <div className="min-h-screen bg-space-black text-white">
      <StarField />
      <Navbar />
      
      <main>
        <Section spacing="normal">
          <PageContainer>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <MessageCircle className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-semibold">AI Investment Advisor</h1>
              </div>
              
              {!isGroqApiKeyAvailable() && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>API Key Missing</AlertTitle>
                  <AlertDescription>
                    Please add your GROQ API key in a <code>.env</code> file (VITE_GROQ_API_KEY=your_key_here) to use the AI advisor with real LLM responses.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="glassmorphism p-6 rounded-lg mb-6">
                <p className="text-muted-foreground mb-4">
                  Ask questions about real estate investing, tokenization, market trends, or get personalized investment advice.
                  {isGroqApiKeyAvailable() && <span className="ml-1 text-primary"> (Using Llama 3 via Groq API)</span>}
                </p>
                
                <div className="bg-background/40 backdrop-blur-sm rounded-lg p-4 h-[400px] mb-4 overflow-y-auto border border-border">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-3 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[80%]">
                        <div
                          className={`p-3 rounded-lg ${
                            msg.isUser
                              ? 'bg-primary/10 text-foreground border border-primary/20'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="ds-body-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${
                          msg.isUser ? 'text-right' : 'text-left'
                        }`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea
                    placeholder="Ask about real estate investing..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="resize-none flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="self-end"
                  >
                    <Send size={18} />
                    {isLoading && <span className="ml-2">Processing...</span>}
                  </Button>
                </form>
              </div>
              
              <div className="glassmorphism p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Investment Strategies', 'Tokenization Benefits', 'Market Trends', 'Risk Management', 'Tax Implications', 'Beginner Tips'].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      onClick={() => setInput(`Tell me about ${topic.toLowerCase()}`)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PageContainer>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdvisorPage;
