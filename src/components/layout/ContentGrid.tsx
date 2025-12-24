import React from 'react';
import { cn } from '@/lib/utils';

interface ContentGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: '1' | '2' | '3' | '4';
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

const colMap: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const gapMap: Record<string, string> = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export const ContentGrid: React.FC<ContentGridProps> = ({
  children,
  className,
  columns = '3',
  gap = 'md',
  responsive = true,
  ...rest
}) => {
  return (
    <div
      className={cn(
        'grid',
        responsive ? colMap[columns] : `grid-cols-${columns}`,
        gapMap[gap],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ContentGrid;
