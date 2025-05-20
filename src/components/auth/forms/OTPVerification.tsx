
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationProps {
  contactValue: string;
  contactType: 'email' | 'phone';
  onVerificationComplete: () => void;
  onResendOTP: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  contactValue,
  contactType,
  onVerificationComplete,
  onResendOTP
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      // In a real implementation, this would call an API to verify the OTP
      const isValid = otp === '123456'; // Simulated validation - in production this would be a real check
      
      if (isValid) {
        toast({
          title: "Verification Successful",
          description: `Your ${contactType} has been successfully verified.`,
        });
        
        setTimeout(() => {
          onVerificationComplete();
        }, 1000);
      } else {
        setAttempts(prev => prev + 1);
        
        if (attempts >= 2) {
          // After 3 failed attempts, enforce a cooldown period
          toast({
            title: "Too Many Failed Attempts",
            description: "Please wait 30 seconds before trying again",
            variant: "destructive"
          });
          
          setCountdown(30);
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          toast({
            title: "Invalid Code",
            description: "The verification code you entered is incorrect. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    // In a real implementation, this would call an API to resend the OTP
    onResendOTP();
    
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    toast({
      title: "Code Resent",
      description: `A new verification code has been sent to your ${contactType}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-orbitron mb-2">Verification Code</h2>
        <p className="text-gray-400">
          Enter the 6-digit code sent to your {contactType}:
          <br />
          <span className="text-space-neon-blue">
            {contactType === 'email' 
              ? contactValue 
              : contactValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
          </span>
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <InputOTP 
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
          disabled={isVerifying || countdown > 0}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex flex-col space-y-3">
        <Button
          onClick={handleVerifyOTP}
          className="cosmic-btn"
          disabled={otp.length !== 6 || isVerifying || countdown > 0}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>

        <Button
          variant="link"
          onClick={handleResendOTP}
          disabled={countdown > 0}
          className="text-space-neon-blue"
        >
          {countdown > 0 
            ? `Resend code in ${countdown}s` 
            : `Didn't receive code? Resend`}
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
