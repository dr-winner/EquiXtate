import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import UserOnboardingService, { KYCSubmission, KYCTier } from '@/services/UserOnboardingService';
import { toast } from '@/components/ui/use-toast';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onKYCComplete: () => void;
}

type KYCStep = 'identity' | 'address' | 'documents' | 'review' | 'success';

const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  onKYCComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<KYCStep>('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Prefill from any existing onboarding to avoid re-typing
  useEffect(() => {
    const loadExisting = async () => {
      if (!walletAddress || !isOpen) return;
      const existing = await UserOnboardingService.getUserOnboarding(walletAddress);
      if (existing?.personalInfo) {
        setFullName(existing.personalInfo.fullName || '');
        setEmail(existing.personalInfo.email || '');
        setCountry(existing.personalInfo.country || '');
        setDateOfBirth(existing.personalInfo.dateOfBirth || '');
      }
    };
    loadExisting();
  }, [walletAddress, isOpen]);

  const handleSubmitKYC = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!fullName || !email || !country || !dateOfBirth) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all personal information fields.',
        });
        return;
      }

      if (!identityFile || !addressProofFile) {
        toast({
          title: 'Missing Documents',
          description: 'Please upload identity and address proof documents.',
        });
        return;
      }

      // Create KYC submission
      const kycSubmission: KYCSubmission = {
        walletAddress,
        personalInfo: {
          fullName,
          email,
          country,
          dateOfBirth,
          nationality: country,
        },
        identityDocument: {
          type: 'passport',
          file: identityFile,
        },
        proofOfAddress: addressProofFile || undefined,
        targetTier: KYCTier.BASIC,
      };

      // Submit KYC
      const result = await UserOnboardingService.submitKYC(kycSubmission);

      if (result.status === 'verified' || result.status === 'approved') {
        setCurrentStep('success');
        toast({
          title: 'KYC Verified',
          description: 'Your identity has been successfully verified!',
        });
        
        // Call success callback after short delay
        setTimeout(() => {
          onKYCComplete();
        }, 2000);
      } else {
        toast({
          title: 'Verification Pending',
          description: 'Your KYC submission has been received. You will be notified once verification is complete.',
        });
        setCurrentStep('success');
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit KYC. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div
        className="relative w-full max-w-[500px] mx-4 glassmorphism border-space-neon-blue/30 rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-space-deep-purple/50 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>

        <h2 className="text-2xl font-orbitron mb-2">Identity Verification (KYC)</h2>
        <p className="text-sm text-gray-400 mb-6">
          Complete verification to unlock property listing and investment features.
        </p>

        {currentStep === 'identity' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-space-deep-purple/30 border-space-neon-blue/30 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-space-deep-purple/30 border-space-neon-blue/30 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="bg-space-deep-purple/30 border-space-neon-blue/30 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">Country of Residence *</Label>
              <Input
                id="country"
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-space-deep-purple/30 border-space-neon-blue/30 mt-1"
              />
            </div>

            <Button
              onClick={() => setCurrentStep('address')}
              disabled={!fullName || !email || !dateOfBirth || !country}
              className="w-full cosmic-btn mt-6"
            >
              Next: Address Verification
            </Button>
          </div>
        )}

        {currentStep === 'address' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Residential Address *</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-space-deep-purple/30 border-space-neon-blue/30 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-space-deep-purple/30 border-space-neon-blue/30 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="10001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="bg-space-deep-purple/30 border-space-neon-blue/30 mt-1"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep('identity')}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep('documents')}
                disabled={!address || !city || !postalCode}
                className="w-full cosmic-btn"
              >
                Next: Documents
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'documents' && (
          <div className="space-y-4">
            <div>
              <Label>Identity Document (Passport/ID) *</Label>
              <div className="border-2 border-dashed border-space-neon-green/50 rounded-lg p-4 text-center cursor-pointer hover:border-space-neon-green transition-colors mt-2">
                <input
                  type="file"
                  onChange={(e) => setIdentityFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="identityFile"
                  accept="image/*,.pdf"
                />
                <label htmlFor="identityFile" className="flex flex-col items-center gap-2 cursor-pointer">
                  {identityFile ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-space-neon-green" />
                      <p className="text-sm font-semibold">{identityFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400" />
                      <p className="text-sm">Click to upload identity document</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <Label>Address Proof (Utility Bill/Bank Statement) *</Label>
              <div className="border-2 border-dashed border-space-neon-green/50 rounded-lg p-4 text-center cursor-pointer hover:border-space-neon-green transition-colors mt-2">
                <input
                  type="file"
                  onChange={(e) => setAddressProofFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="addressProofFile"
                  accept="image/*,.pdf"
                />
                <label htmlFor="addressProofFile" className="flex flex-col items-center gap-2 cursor-pointer">
                  {addressProofFile ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-space-neon-green" />
                      <p className="text-sm font-semibold">{addressProofFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400" />
                      <p className="text-sm">Click to upload address proof</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep('address')}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep('review')}
                disabled={!identityFile || !addressProofFile}
                className="w-full cosmic-btn"
              >
                Review & Submit
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-4">
            <div className="space-y-3 bg-space-deep-purple/20 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span>{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-sm">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Address:</span>
                <span className="text-sm">{`${city}, ${country}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Documents:</span>
                <span className="text-sm">2 files uploaded</span>
              </div>
            </div>

            <div className="bg-space-deep-purple/20 border border-space-neon-blue/30 p-3 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-space-neon-blue flex-shrink-0" />
              <p className="text-xs text-gray-300">
                By submitting, you certify that the information provided is accurate and complete.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep('documents')}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitKYC}
                disabled={isSubmitting}
                className="w-full cosmic-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Submit KYC'
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-space-neon-green mx-auto" />
            <h3 className="text-xl font-orbitron">Verification Submitted!</h3>
            <p className="text-gray-300 text-sm">
              Your KYC application has been received. Verification typically completes within 24 hours.
            </p>
            <p className="text-gray-400 text-xs">
              You can now list properties while we verify your identity.
            </p>
            <Button onClick={onClose} className="w-full cosmic-btn mt-6">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCModal;
