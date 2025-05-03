
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  handleSendMessage: (message: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  input, 
  setInput, 
  isLoading, 
  handleSendMessage,
  inputRef
}) => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-3 bg-space-deep-purple/30 border-t border-space-neon-blue/30 flex gap-2">
      <Textarea
        ref={inputRef}
        placeholder="Ask about real estate investing..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
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
  );
};

export default ChatInput;
