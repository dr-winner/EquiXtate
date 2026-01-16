import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KYCTier } from '@/services/UserOnboardingService';

interface KYCStatusDisplayProps {
  isKYCVerified: boolean;
  kycTier: KYCTier;
  onStartKYC: () => void;
}

const KYCStatusDisplay: React.FC<KYCStatusDisplayProps> = ({
  isKYCVerified,
  kycTier,
  onStartKYC,
}) => {
  const getTierLabel = (tier: KYCTier): string => {
    switch (tier) {
      case KYCTier.NONE:
        return 'Not Verified';
      case KYCTier.BASIC:
        return 'Basic';
      case KYCTier.STANDARD:
        return 'Standard';
      case KYCTier.ENHANCED:
        return 'Enhanced';
      default:
        return 'Unknown';
    }
  };

  const getTierDescription = (tier: KYCTier): string => {
    switch (tier) {
      case KYCTier.NONE:
        return 'No verification completed';
      case KYCTier.BASIC:
        return 'Identity verified';
      case KYCTier.STANDARD:
        return 'Identity + Address verified';
      case KYCTier.ENHANCED:
        return 'Full verification (accredited investor)';
      default:
        return '';
    }
  };

  return (
    <div className="glassmorphism border-space-neon-blue/30 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-space-neon-blue" />
          <h2 className="text-xl font-orbitron">KYC Verification</h2>
        </div>
        {isKYCVerified ? (
          <CheckCircle2 className="h-6 w-6 text-space-neon-green" />
        ) : (
          <AlertCircle className="h-6 w-6 text-yellow-500" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={`font-semibold ${isKYCVerified ? 'text-space-neon-green' : 'text-yellow-500'}`}>
            {isKYCVerified ? 'Verified' : 'Pending'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Tier:</span>
          <span className="font-semibold text-space-neon-blue">{getTierLabel(kycTier)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Details:</span>
          <span className="text-sm text-gray-300">{getTierDescription(kycTier)}</span>
        </div>
      </div>

      {!isKYCVerified && (
        <div className="bg-space-deep-purple/20 border border-space-neon-blue/30 p-3 rounded-lg flex gap-3">
          <Clock className="h-5 w-5 text-space-neon-blue flex-shrink-0" />
          <p className="text-sm text-gray-300">
            Complete identity verification to unlock property listing and investment features.
          </p>
        </div>
      )}

      {!isKYCVerified && (
        <Button
          onClick={onStartKYC}
          className="w-full cosmic-btn"
        >
          Start KYC Verification
        </Button>
      )}

      {isKYCVerified && (
        <div className="bg-space-deep-purple/20 border border-space-neon-green/30 p-3 rounded-lg">
          <p className="text-sm text-space-neon-green">
            ✓ Your identity has been verified by KRNL Protocol
          </p>
        </div>
      )}
    </div>
  );
};

export default KYCStatusDisplay;
