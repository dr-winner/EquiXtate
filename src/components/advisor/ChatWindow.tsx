
import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/hooks/useAIAdvisor';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import QuickTopics from './QuickTopics';

interface ChatWindowProps {
  isOpen: boolean;
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  handleSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  isMobile: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  messages,
  input,
  setInput,
  isLoading,
  handleSendMessage,
  messagesEndRef,
  inputRef,
  isMobile,
  setIsOpen
}) => {
  if (!isOpen) return null;

  // Chat window dimensions based on device type
  const chatWindowStyles = isMobile ? {
    width: "100%",
    maxWidth: "none",
    bottom: "16px",
    right: "16px",
    left: "16px"
  } : {};

  return (
    <div
      className="fixed bottom-24 right-6 z-50 w-80 md:w-96 glassmorphism neon-border-green rounded-lg shadow-xl overflow-hidden"
      style={chatWindowStyles}
    >
      <div className="p-4 bg-space-deep-purple/50 flex items-center justify-between border-b border-space-neon-blue/30">
        <div className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-space-neon-blue" />
          <h3 className="text-lg font-orbitron text-white">AI Investment Advisor</h3>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-gray-300"
          >
            <X size={18} />
          </Button>
        )}
      </div>
      
      <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
      
      <ChatInput 
        input={input} 
        setInput={setInput}
        isLoading={isLoading}
        handleSendMessage={handleSendMessage}
        inputRef={inputRef}
      />
      
      <QuickTopics setInput={setInput} />
    </div>
  );
};

export default ChatWindow;
