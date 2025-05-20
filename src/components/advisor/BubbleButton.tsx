
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
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-space-neon-blue text-white shadow-lg flex items-center justify-center hover:bg-space-neon-blue/80 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
    </motion.button>
  );
};

export default BubbleButton;
