/**
 * KRNL Provider Wrapper
 * 
 * Wraps the application with KRNLProvider from @krnl-dev/sdk-react-7702
 * for EIP-7702 delegated account workflows.
 */

import React from 'react';
import { KRNLProvider } from '@krnl-dev/sdk-react-7702';
import { krnlConfig } from '@/lib/krnlConfig';

interface KRNLWrapperProps {
  children: React.ReactNode;
}

export function KRNLWrapper({ children }: KRNLWrapperProps) {
  return (
    <KRNLProvider config={krnlConfig}>
      {children}
    </KRNLProvider>
  );
}

export default KRNLWrapper;
