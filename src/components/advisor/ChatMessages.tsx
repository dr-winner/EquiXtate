
import React from 'react';
import { Message } from '@/hooks/useAIAdvisor';

interface ChatMessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Simple markdown renderer for AI responses
const renderMarkdown = (text: string) => {
  // Split by lines to process markdown
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        React.createElement(
          ListTag,
          { key: `list-${elements.length}`, className: 'list-disc list-inside space-y-1 my-2 ml-4' },
          currentList.map((item, idx) => (
            <li key={idx} className="text-sm">{item}</li>
          ))
        )
      );
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-base font-semibold text-space-neon-blue mt-3 mb-2">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-lg font-bold text-space-neon-purple mt-4 mb-2">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={index} className="text-xl font-bold text-space-neon-green mt-4 mb-2">
          {trimmed.substring(2)}
        </h1>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    }
    // Bullet lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(trimmed.substring(2));
    }
    // Empty line
    else if (trimmed === '') {
      flushList();
      const lastElement = elements[elements.length - 1];
      if (!lastElement || (typeof lastElement === 'object' && 'type' in lastElement && lastElement.type !== 'br')) {
        elements.push(<br key={`br-${index}`} />);
      }
    }
    // Regular paragraph
    else {
      flushList();
      // Process bold text
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const processed = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-semibold text-space-neon-blue">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      
      elements.push(
        <p key={index} className="text-sm leading-relaxed mb-2">
          {processed}
        </p>
      );
    }
  });

  flushList();
  return elements.length > 0 ? elements : [text];
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="h-80 overflow-y-auto p-4 bg-space-black/80">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`mb-4 ${msg.isUser ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
        >
          <div
            className={`p-4 rounded-lg prose prose-invert max-w-none ${
              msg.isUser
                ? 'bg-space-neon-blue/20 text-white ml-auto'
                : 'bg-space-deep-purple/50 text-gray-100'
            }`}
          >
            {msg.isUser ? (
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <div className="text-sm space-y-1">
                {renderMarkdown(msg.content)}
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
  );
};

export default ChatMessages;
