import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'normal' | 'loose';
  dividerTop?: boolean;
  dividerBottom?: boolean;
}

const spacingMap: Record<string, string> = {
  tight: 'py-8',
  normal: 'py-14',
  loose: 'py-20',
};

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  spacing = 'normal',
  dividerTop = false,
  dividerBottom = false,
  ...rest
}) => {
  return (
    <section
      className={cn(
        'w-full',
        spacingMap[spacing],
        dividerTop && 'border-t border-border/40',
        dividerBottom && 'border-b border-border/40',
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
};

export default Section;
