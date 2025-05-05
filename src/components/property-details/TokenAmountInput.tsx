
import React from 'react';

interface TokenAmountInputProps {
  tokenAmount: number;
  setTokenAmount: (amount: number) => void;
  tokensAvailable: number;
  minTokenAmount?: number;
}

const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  tokenAmount,
  setTokenAmount,
  tokensAvailable,
  minTokenAmount = 1
}) => {
  return (
    <div className="flex items-center mt-1">
      <button 
        className="bg-space-deep-purple/50 text-white w-8 h-8 flex items-center justify-center rounded-l-md"
        onClick={() => setTokenAmount(Math.max(minTokenAmount, tokenAmount - 1))}
      >-</button>
      
      <input 
        type="number" 
        min={minTokenAmount}
        max={tokensAvailable}
        value={tokenAmount}
        onChange={(e) => {
          const value = parseInt(e.target.value) || minTokenAmount;
          setTokenAmount(Math.min(tokensAvailable, Math.max(minTokenAmount, value)));
        }}
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
