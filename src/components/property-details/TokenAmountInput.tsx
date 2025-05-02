
import React from 'react';

interface TokenAmountInputProps {
  tokenAmount: number;
  setTokenAmount: (amount: number) => void;
  tokensAvailable: number;
}

const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  tokenAmount,
  setTokenAmount,
  tokensAvailable,
}) => {
  return (
    <div className="flex items-center mt-1">
      <button 
        className="bg-space-deep-purple/50 text-white w-8 h-8 flex items-center justify-center rounded-l-md"
        onClick={() => setTokenAmount(Math.max(1, tokenAmount - 1))}
      >-</button>
      
      <input 
        type="number" 
        min="1"
        max={tokensAvailable}
        value={tokenAmount}
        onChange={(e) => setTokenAmount(Math.min(tokensAvailable, Math.max(1, parseInt(e.target.value) || 1)))}
        className="bg-space-deep-purple/30 border-y border-space-deep-purple text-center text-white w-16 h-8 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      
      <button 
        className="bg-space-deep-purple/50 text-white w-8 h-8 flex items-center justify-center rounded-r-md"
        onClick={() => setTokenAmount(Math.min(tokensAvailable, tokenAmount + 1))}
      >+</button>
    </div>
  );
};

export default TokenAmountInput;
