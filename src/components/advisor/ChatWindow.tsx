
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
      className="fixed bottom-24 right-6 z-50 w-80 md:w-96 glassmorphism rounded-lg shadow-2xl overflow-hidden border border-border"
      style={chatWindowStyles}
    >
      <div className="p-4 bg-background/80 backdrop-blur-sm flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Investment Advisor</h3>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
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
