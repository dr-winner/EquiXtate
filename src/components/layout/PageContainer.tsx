import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: 'default' | 'wide' | 'full';
  padded?: boolean;
}

const widthMap: Record<string, string> = {
  default: 'max-w-[960px]',
  wide: 'max-w-[1280px]',
  full: 'w-full',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  width = 'wide',
  padded = true,
  ...rest
}) => {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        widthMap[width],
        padded && 'px-6 md:px-8',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default PageContainer;
