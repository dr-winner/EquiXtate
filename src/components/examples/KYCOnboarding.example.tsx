import React, { useState } from 'react';
import { useSumsubKYC } from '@/hooks/useSumsubKYC';
import SumsubWebSDK from '@/components/auth/SumsubWebSDK';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

/**
 * Example: Complete KYC Flow Integration
 * Shows how to integrate Sumsub into your user onboarding
 */

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  kycStatus?: string;
}

export function UserKYCOnboarding({ user }: { user: User }) {
  const [kycResult, setKycResult] = useState<Record<string, unknown> | null>(null);

  const {
    isOpen,
    openKYC,
    closeKYC,
    isLoading,
    error,
    verificationStatus,
    refreshVerificationStatus,
  } = useSumsubKYC({
    userId: user.id,
    email: user.email,
    phone: user.phone,
    levelName: 'basic-kyc-level', // or 'compliance-kyc-level' for properties
    onSuccess: (result) => {
      console.log('✅ KYC Verification Successful!', result);
      setKycResult(result);
      // Update user profile in your backend
      // await updateUserKYCStatus(user.id, 'verified');
    },
    onError: (error) => {
      console.error('❌ KYC Verification Failed:', error);
      // Show error toast
      // toast({ title: 'KYC Failed', description: error.message });
    },
  });

  const getStatusDisplay = () => {
    if (verificationStatus === 'success') {
      return (
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2 className="w-5 h-5" />
          <span>Verified</span>
        </div>
      );
    }
    if (verificationStatus === 'failed') {
      return (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>Verification Failed</span>
        </div>
      );
    }
    if (verificationStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 text-yellow-500">
          <Clock className="w-5 h-5" />
          <span>Pending Review</span>
        </div>
      );
    }
    return <span className="text-gray-400">Not Started</span>;
  };

  return (
    <div className="space-y-6">
      {/* KYC Status Card */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">KYC Verification</h2>
          {getStatusDisplay()}
        </div>

        <p className="text-gray-400 mb-4">
          Complete identity verification to unlock full platform access and property investment features.
        </p>

        {/* User Info Summary */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="text-white font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-500">Error</h3>
                <p className="text-sm text-red-400">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={openKYC}
            disabled={isLoading || verificationStatus === 'success'}
            className="flex-1"
          >
            {isLoading ? 'Loading...' : 'Start Verification'}
          </Button>

          {verificationStatus === 'pending' && (
            <Button
              onClick={refreshVerificationStatus}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Check Status'}
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          🔒 Your information is securely processed by Sumsub, a leading identity verification provider.
        </p>
      </Card>

      {/* Verification Timeline */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Verification Timeline</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Identity Document</p>
              <p className="text-sm text-gray-400">Upload passport, driver's license, or ID</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Liveness Check</p>
              <p className="text-sm text-gray-400">Take a selfie to confirm you're present</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Review</p>
              <p className="text-sm text-gray-400">
                {verificationStatus === 'pending'
                  ? 'Your verification is being reviewed (1-24 hours)'
                  : 'Pending submission'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                verificationStatus === 'success' ? 'bg-green-500' : 'bg-gray-600'
              } mt-2 flex-shrink-0`}
            />
            <div>
              <p className="font-medium text-white">Complete</p>
              <p className="text-sm text-gray-400">Full access granted to platform</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Card */}
      {kycResult && (
        <Card className="p-6 bg-green-500/10 border border-green-500/20">
          <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Verification Successful</h3>
          <p className="text-green-300 text-sm mb-4">
            Your identity has been verified. You now have access to all platform features.
          </p>
          <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-auto">
            {JSON.stringify(kycResult, null, 2)}
          </pre>
        </Card>
      )}

      {/* Sumsub WebSDK Modal */}
      <SumsubWebSDK
        isOpen={isOpen}
        onClose={closeKYC}
        userId={user.id}
        email={user.email}
        phone={user.phone}
        levelName="basic-kyc-level"
        onVerificationComplete={(status, result) => {
          console.log('Verification completed:', status, result);
          setKycResult(result);
        }}
      />
    </div>
  );
}

/**
 * Alternative: Simplified KYC Button (for existing users)
 */
export function QuickKYCButton({ user }: { user: User }) {
  const { isOpen, openKYC, closeKYC } = useSumsubKYC({
    userId: user.id,
    email: user.email,
  });

  return (
    <>
      <Button onClick={openKYC} size="sm">
        Verify Identity
      </Button>
      <SumsubWebSDK
        isOpen={isOpen}
        onClose={closeKYC}
        userId={user.id}
        email={user.email}
      />
    </>
  );
}

/**
 * Usage in main app:
 *
 * import { UserKYCOnboarding } from '@/components/examples/KYCOnboarding';
 *
 * function App() {
 *   const user = {
 *     id: 'user_123',
 *     email: 'user@example.com',
 *     phone: '+1234567890',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *   };
 *
 *   return <UserKYCOnboarding user={user} />;
 * }
 */
