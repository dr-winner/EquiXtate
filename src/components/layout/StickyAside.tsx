import React from 'react';
import { cn } from '@/lib/utils';

interface StickyAsideProps extends React.HTMLAttributes<HTMLDivElement> {
  topOffset?: number;
}

export const StickyAside: React.FC<StickyAsideProps> = ({
  children,
  className,
  topOffset = 88, // approx navbar height + spacing
  ...rest
}) => {
  return (
    <div
      className={cn('lg:sticky', className)}
      style={{ top: `${topOffset}px` }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default StickyAside;
