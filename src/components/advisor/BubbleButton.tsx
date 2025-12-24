
import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface BubbleButtonProps {
  isOpen: boolean;
  toggleAdvisor: () => void;
}

const BubbleButton: React.FC<BubbleButtonProps> = ({ isOpen, toggleAdvisor }) => {
  return (
    <motion.button
      onClick={toggleAdvisor}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
    </motion.button>
  );
};

export default BubbleButton;
