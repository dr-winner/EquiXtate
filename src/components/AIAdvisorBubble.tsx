import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { advisorResponses, contextResponses } from '@/data/aiAdvisorResponses';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConversationState {
  needsClarification: boolean;
  followUpCount: number;
  lastResponse?: typeof advisorResponses[0];
}

const AIAdvisorBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your EquiXtate AI financial advisor. How can I help you with real estate investing today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    needsClarification: false,
    followUpCount: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleAdvisor = () => {
    setIsOpen(!isOpen);
  };

  const getRandomResponse = (responses: string[]): string => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const findMatchingResponse = (query: string): typeof advisorResponses[0] | null => {
    const lowercaseQuery = query.toLowerCase();
    
    for (const response of advisorResponses) {
      for (const pattern of response.patterns) {
        if (lowercaseQuery.includes(pattern)) {
          return response;
        }
      }
    }
    
    return null;
  };

  const shouldAskForClarification = (): boolean => {
    return conversationState.needsClarification || 
           (messages.length > 0 && 
            messages[messages.length - 1].isUser &&
            !findMatchingResponse(messages[messages.length - 1].content));
  };

  const shouldFollowUp = (): boolean => {
    return conversationState.followUpCount < 2 && 
           Math.random() < 0.3; // 30% chance of follow-up
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
      // Simulate AI response
      setTimeout(() => {
        let response: string;
        
        // Handle clarification requests
        if (shouldAskForClarification()) {
          setConversationState(prev => ({ ...prev, needsClarification: false }));
          response = getRandomResponse(contextResponses.clarificationRequests);
        } else {
          // Find matching response
          const matchingResponse = findMatchingResponse(input);
          
          if (matchingResponse) {
            setConversationState(prev => ({
              ...prev,
              lastResponse: matchingResponse,
              followUpCount: 0
            }));
            
            // Add some randomness to make it feel more natural
            if (shouldFollowUp()) {
              setConversationState(prev => ({
                ...prev,
                followUpCount: prev.followUpCount + 1
              }));
              response = getRandomResponse(contextResponses.followUpQuestions);
            } else {
              response = getRandomResponse(matchingResponse.responses);
            }
          } else {
            // If no match found, ask for clarification
            setConversationState(prev => ({
              ...prev,
              needsClarification: true
            }));
            response = getRandomResponse(contextResponses.errorResponses);
          }
        }
        
        setMessages(prev => [...prev, {
          content: response,
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

  return (
    <>
      {/* Bubble button */}
      <motion.button
        onClick={toggleAdvisor}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-space-neon-blue text-white shadow-lg flex items-center justify-center hover:bg-space-neon-blue/80 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 glassmorphism neon-border-green rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-4 bg-space-deep-purple/50 flex items-center border-b border-space-neon-blue/30">
              <MessageCircle className="w-5 h-5 mr-2 text-space-neon-blue" />
              <h3 className="text-lg font-orbitron text-white">AI Investment Advisor</h3>
            </div>
            
            <div className="h-80 overflow-y-auto p-4 bg-space-black/80">
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
            
            <form onSubmit={handleSendMessage} className="p-3 bg-space-deep-purple/30 border-t border-space-neon-blue/30 flex gap-2">
              <Textarea
                placeholder="Ask about real estate investing... (Press Enter to send, Shift+Enter for new line)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                className="resize-none bg-space-deep-purple/20 border-space-neon-blue/50 rounded-lg flex-1 h-10 py-2"
                disabled={isLoading}
              />
              <Button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-space-neon-blue hover:bg-space-neon-blue/80 self-end h-10 w-10 p-0 flex items-center justify-center"
                size="icon"
              >
                <Send size={18} />
              </Button>
            </form>
            
            <div className="p-2 bg-space-deep-purple/30 border-t border-space-neon-blue/30 flex flex-wrap gap-1">
              {['Investment', 'Tokenization', 'Risk', 'ROI', 'Taxes', 'Tips'].map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  className="border-space-neon-blue/50 hover:bg-space-deep-purple/30 text-gray-300 text-xs py-0 h-6"
                  onClick={() => setInput(`Tell me about ${topic.toLowerCase()}`)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAdvisorBubble;
