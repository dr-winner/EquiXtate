
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAIAdvisor } from '@/hooks/useAIAdvisor';
import BubbleButton from './advisor/BubbleButton';
import ChatWindow from './advisor/ChatWindow';

const AIAdvisorBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const { messages, input, setInput, isLoading, handleSendMessage } = useAIAdvisor();
  
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus the textarea when the chat opens
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleAdvisor = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Bubble button */}
      <BubbleButton isOpen={isOpen} toggleAdvisor={toggleAdvisor} />

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ChatWindow
              isOpen={isOpen}
              messages={messages}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              handleSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
              inputRef={inputRef}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAdvisorBubble;
