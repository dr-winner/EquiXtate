
import React from 'react';

interface RegistrationStepIndicatorsProps {
  currentStep: number;
  maxSteps: number;
}

const RegistrationStepIndicators: React.FC<RegistrationStepIndicatorsProps> = ({ 
  currentStep, 
  maxSteps 
}) => {
  return (
    <div className="flex justify-center items-center space-x-2 mb-6">
      {[...Array(maxSteps)].map((_, index) => {
        const stepNumber = index + 1;
        return (
          <div 
            key={index} 
            className={`h-2 w-2 rounded-full transition-all ${
              stepNumber < currentStep
                ? "bg-space-neon-green" 
                : stepNumber === currentStep 
                  ? "bg-space-neon-blue" 
                  : "bg-gray-500"
            }`}
          />
        );
      })}
    </div>
  );
};

export default RegistrationStepIndicators;
