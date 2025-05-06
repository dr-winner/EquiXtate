import React, { createContext, useContext, useState } from 'react';
import StarField from '@/components/StarField';

interface StarFieldContextType {
  isVisible: boolean;
  showStarField: () => void;
  hideStarField: () => void;
}

const StarFieldContext = createContext<StarFieldContextType | undefined>(undefined);

export const StarFieldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  const showStarField = () => setIsVisible(true);
  const hideStarField = () => setIsVisible(false);

  return (
    <StarFieldContext.Provider value={{ isVisible, showStarField, hideStarField }}>
      {isVisible && <StarField />}
      {children}
    </StarFieldContext.Provider>
  );
};

export const useStarField = () => {
  const context = useContext(StarFieldContext);
  if (context === undefined) {
    throw new Error('useStarField must be used within a StarFieldProvider');
  }
  return context;
}; 