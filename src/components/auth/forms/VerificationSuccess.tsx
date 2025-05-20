
import React from 'react';
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const VerificationSuccess: React.FC = () => {
  return (
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <div className="w-20 h-20 rounded-full bg-space-neon-green/20 flex items-center justify-center mb-6">
        <Check className="h-12 w-12 text-space-neon-green" />
      </div>
      <h2 className="text-2xl font-orbitron text-white mb-4">Verification Complete!</h2>
      <p className="text-center text-gray-300 mb-6">
        Your identity has been successfully verified. You now have full access to EquiXtate platform.
      </p>
    </motion.div>
  );
};

export default VerificationSuccess;
