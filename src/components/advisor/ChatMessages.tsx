
import React from 'react';
import { Message } from '@/hooks/useAIAdvisor';

interface ChatMessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="h-80 overflow-y-auto p-4 bg-background/40 backdrop-blur-sm">
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
  );
};

export default ChatMessages;
