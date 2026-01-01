import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { toast } from '@/components/ui/use-toast';
import { isValidEmail, validatePasswordStrength } from '@/utils/validation';

// Import our new component files
import LoginForm from './forms/LoginForm';
import RegistrationStepOne from './forms/RegistrationStepOne';
import RegistrationStepTwo from './forms/RegistrationStepTwo';
import RegistrationStepThree from './forms/RegistrationStepThree';
import VerificationSuccess from './forms/VerificationSuccess';
import RegistrationStepIndicators from './forms/RegistrationStepIndicators';

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const AuthenticationModal: React.FC<AuthenticationModalProps> = ({ 
  isOpen, 
  onClose,
  onAuthSuccess
}) => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [verificationComplete, setVerificationComplete] = useState<boolean>(false);
  
  // Step 2 state
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  
  // Step 3 state
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  
  // Steps for the KYC verification process
  const MAX_STEPS = 3;

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      // Validate Step 1: Email, Password, Confirm Password
      if (!email || !isValidEmail(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return false;
      }
      
      if (!password) {
        toast({
          title: "Password Required",
          description: "Please enter a password",
          variant: "destructive"
        });
        return false;
      }
      
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        toast({
          title: "Weak Password",
          description: passwordValidation.errors[0] || "Password does not meet requirements",
          variant: "destructive"
        });
        return false;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure both passwords match",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } else if (step === 2) {
      // Validate Step 2: ID Document and Selfie
      if (!idDocument) {
        toast({
          title: "ID Document Required",
          description: "Please upload a government-issued ID",
          variant: "destructive"
        });
        return false;
      }
      
      if (!selfieImage) {
        toast({
          title: "Selfie Required",
          description: "Please upload a selfie photo for verification",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } else if (step === 3) {
      // Validate Step 3: Address, Phone, Address Proof, Terms
      if (!address || address.trim().length < 10) {
        toast({
          title: "Address Required",
          description: "Please enter your full address",
          variant: "destructive"
        });
        return false;
      }
      
      if (!phone || phone.trim().length < 10) {
        toast({
          title: "Phone Number Required",
          description: "Please enter a valid phone number",
          variant: "destructive"
        });
        return false;
      }
      
      if (!addressProofFile) {
        toast({
          title: "Address Proof Required",
          description: "Please upload proof of address document",
          variant: "destructive"
        });
        return false;
      }
      
      if (!termsAccepted) {
        toast({
          title: "Terms Acceptance Required",
          description: "Please accept the terms and conditions",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "login") {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 1500);
    } else {
      // Registration process - validate before moving to next step
      if (!validateStep(currentStep)) {
        return;
      }
      
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        if (currentStep < MAX_STEPS) {
          setCurrentStep(prev => prev + 1);
        } else {
          // Complete registration
          setVerificationComplete(true);
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess();
            onClose();
          }, 2000);
        }
      }, 1500);
    }
  };

  const handleCancel = () => {
    // Reset form state to initial values before closing
    setCurrentStep(1);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setVerificationComplete(false);
    setActiveTab("login");
    setIdDocument(null);
    setSelfieImage(null);
    setAddress("");
    setPhone("");
    setAddressProofFile(null);
    setTermsAccepted(false);
    onClose();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setVerificationComplete(false);
      setActiveTab("login");
      setIdDocument(null);
      setSelfieImage(null);
      setAddress("");
      setPhone("");
      setAddressProofFile(null);
      setTermsAccepted(false);
    }
  }, [isOpen]);

  const renderRegistrationStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <>
            <DialogTitle className="text-2xl font-orbitron mb-6">Create Your Account</DialogTitle>
            <RegistrationStepOne 
              email={email} 
              setEmail={setEmail} 
              password={password} 
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
            />
          </>
        );
      case 2:
        return (
          <>
            <DialogTitle className="text-2xl font-orbitron mb-6">Identity Verification</DialogTitle>
            <DialogDescription className="mb-6">
              We require ID verification to comply with legal requirements and ensure platform security.
            </DialogDescription>
            <RegistrationStepTwo 
              idDocument={idDocument}
              setIdDocument={setIdDocument}
              selfieImage={selfieImage}
              setSelfieImage={setSelfieImage}
            />
          </>
        );
      case 3:
        return (
          <>
            <DialogTitle className="text-2xl font-orbitron mb-6">Proof of Address</DialogTitle>
            <DialogDescription className="mb-6">
              Please provide documentation that confirms your residential address.
            </DialogDescription>
            <RegistrationStepThree 
              address={address}
              setAddress={setAddress}
              phone={phone}
              setPhone={setPhone}
              addressProofFile={addressProofFile}
              setAddressProofFile={setAddressProofFile}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
            />
          </>
        );
      default:
        return null;
    }
  };
  
  // Success verification completed screen
  if (verificationComplete) {
    return (
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open && isOpen) {
            handleCancel();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] glassmorphism border-space-neon-blue/30">
          <button 
            onClick={handleCancel} 
            type="button"
            className="absolute top-3 right-3 z-[100] p-2 rounded-sm opacity-80 hover:opacity-100 hover:bg-accent/50 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-space-neon-purple hover:text-space-neon-blue transition-colors" />
          </button>
          <VerificationSuccess />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only handle close, let open be handled by parent
        if (!open && isOpen) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] glassmorphism border-space-neon-blue/30 !grid-rows-[auto]">
        <button 
          onClick={handleCancel} 
          type="button"
          className="absolute top-3 right-3 z-[100] p-2 rounded-sm opacity-80 hover:opacity-100 hover:bg-accent/50 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-space-neon-purple hover:text-space-neon-blue transition-colors" />
        </button>
        <DialogHeader className="relative z-10 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit}>
                <DialogTitle className="text-2xl font-orbitron mb-6">Welcome Back</DialogTitle>
                <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSubmit}>
                <RegistrationStepIndicators currentStep={currentStep} maxSteps={MAX_STEPS} />
                {renderRegistrationStep()}
                <div className="flex justify-between mt-6">
                  {currentStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="border-space-neon-blue text-space-neon-blue"
                    >
                      Back
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className={`cosmic-btn ${currentStep === 1 ? 'w-full' : ''}`} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : currentStep === MAX_STEPS ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Complete Registration
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AuthenticationModal;
