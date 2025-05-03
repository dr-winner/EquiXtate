
import React from 'react';
import { Message } from '@/hooks/useAIAdvisor';

interface ChatMessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, messagesEndRef }) => {
  return (
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
  );
};

export default ChatMessages;
