
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickTopicsProps {
  setInput: (input: string) => void;
}

const QuickTopics: React.FC<QuickTopicsProps> = ({ setInput }) => {
  const topics = ['Investment', 'Tokenization', 'Risk', 'ROI', 'Taxes', 'Tips'];
  
  return (
    <div className="p-2 bg-background/60 backdrop-blur-sm border-t border-border flex flex-wrap gap-1">
      {topics.map((topic) => (
        <Button
          key={topic}
          variant="outline"
          size="sm"
          className="text-xs py-0 h-6"
          onClick={() => setInput(`Tell me about ${topic.toLowerCase()}`)}
        >
          {topic}
        </Button>
      ))}
    </div>
  );
};

export default QuickTopics;
