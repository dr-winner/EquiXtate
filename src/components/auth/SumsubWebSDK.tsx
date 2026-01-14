import React, { useEffect, useState, useRef } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import snsWebSdk from '@sumsub/websdk';
import SumsubService from '@/services/SumsubService';
import { toast } from '@/components/ui/use-toast';

interface SumsubWebSDKProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  phone?: string;
  onVerificationComplete?: (status: string, result?: Record<string, unknown>) => void;
  levelName?: string; // 'basic-kyc-level' or 'compliance-kyc-level'
}

const SumsubWebSDK: React.FC<SumsubWebSDKProps> = ({
  isOpen,
  onClose,
  userId,
  email,
  phone,
  onVerificationComplete,
  levelName = 'basic-kyc-level',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number>(0);

  // Initialize SDK when modal opens
  useEffect(() => {
    if (!isOpen) return;
    initializeSdk();
  }, [isOpen]);

  const getNewAccessToken = async (): Promise<string> => {
    try {
      // Check if current token is still valid
      if (accessToken && tokenExpiresAt && !SumsubService.isTokenExpired(tokenExpiresAt)) {
        return accessToken;
      }

      // Generate new token from backend
      const response = await fetch('/api/sumsub/access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          phone,
          levelName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      setAccessToken(data.token);
      setTokenExpiresAt(data.expiresAt);
      return data.token;
    } catch (err) {
      console.error('Error getting access token:', err);
      throw err;
    }
  };

  const initializeSdk = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get initial access token
      const token = await getNewAccessToken();

      // Initialize SDK with builder pattern
      const snsWebSdkInstance = snsWebSdk
        .init(
          token,
          // token update callback, must return Promise
          () => getNewAccessToken()
        )
        .withConf({
          lang: 'en', // language of WebSDK texts and comments (ISO 639-1 format)
          theme: 'dark', // Match EquiXtate dark theme
          email,
          phone,
        })
        .withOptions({
          addViewportTag: true,
          adaptIframeHeight: true,
          enableScrollIntoView: true,
        })
        .on('idCheck.onStepCompleted', (payload: any) => {
          console.log('Step completed:', payload);
          toast({
            title: 'Step Completed',
            description: `${payload.stepName} completed successfully.`,
          });
        })
        .on('onError', (error: any) => {
          console.error('SDK Error:', error);
          setError(error.message || 'An error occurred during verification');
          toast({
            title: 'Verification Error',
            description: error.message || 'An error occurred',
            variant: 'destructive',
          });
        })
        .onMessage((type: string, payload: any) => {
          console.log('onMessage', type, payload);

          // Handle completion
          if (type === 'idCheck.onComplete') {
            toast({
              title: 'Verification Complete',
              description: 'Your verification has been submitted for review.',
            });
            if (onVerificationComplete) {
              onVerificationComplete('success', payload);
            }
            // Auto close after 2 seconds
            setTimeout(() => {
              onClose();
            }, 2000);
          }
        })
        .build();

      sdkInstanceRef.current = snsWebSdkInstance;

      // Launch the WebSDK by providing the container element for it
      if (containerRef.current) {
        snsWebSdkInstance.launch(containerRef.current);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Sumsub SDK:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Identity Verification</h2>
            <p className="text-sm text-gray-400 mt-1">
              Verify your identity to complete KYC requirements
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-300">Initializing verification...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-500">Verification Error</h3>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 bg-gray-800 p-4 text-xs text-gray-400">
          <p>
            Your information is securely processed by Sumsub, a leading identity verification
            provider. By proceeding, you agree to their{' '}
            <a href="https://sumsub.com/privacy-notice/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SumsubWebSDK;
