import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";

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
  const [verificationComplete, setVerificationComplete] = useState<boolean>(false);
  
  // Steps for the KYC verification process
  const MAX_STEPS = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (activeTab === "login") {
        // Handle login success
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      } else {
        // Registration process - move to next step
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
      }
    }, 1500);
  };

  const handleCancel = () => {
    // Reset form state to initial values before closing
    setCurrentStep(1);
    setEmail("");
    setPassword("");
    setVerificationComplete(false);
    setActiveTab("login");
    onClose();
  };

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
            <RegistrationStepTwo />
          </>
        );
      case 3:
        return (
          <>
            <DialogTitle className="text-2xl font-orbitron mb-6">Proof of Address</DialogTitle>
            <DialogDescription className="mb-6">
              Please provide documentation that confirms your residential address.
            </DialogDescription>
            <RegistrationStepThree />
          </>
        );
      default:
        return null;
    }
  };
  
  // Success verification completed screen
  if (verificationComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}>
        <DialogContent className="sm:max-w-[500px] glassmorphism border-space-neon-blue/30">
          <VerificationSuccess />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleCancel();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] glassmorphism border-space-neon-blue/30">
        <DialogHeader>
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
