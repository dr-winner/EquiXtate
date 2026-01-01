
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";

interface RegistrationStepOneProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
}

const RegistrationStepOne: React.FC<RegistrationStepOneProps> = ({ 
  email, 
  setEmail, 
  password, 
  setPassword,
  confirmPassword,
  setConfirmPassword
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-space-deep-purple/30 border-space-neon-blue/30 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-space-neon-blue hover:text-space-neon-purple transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirm-password" 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={password && confirmPassword && password !== confirmPassword ? "border-red-500" : ""}
              className="bg-space-deep-purple/30 border-space-neon-blue/30 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-space-neon-blue hover:text-space-neon-purple transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>
        
        <div className="bg-space-deep-purple/30 p-4 rounded-lg border border-space-neon-purple/30 mt-6">
          <h4 className="text-sm font-medium text-space-neon-purple flex items-center mb-2">
            <Shield className="h-4 w-4 mr-2" />
            KYC Verification Required
          </h4>
          <p className="text-xs text-gray-400">
            To comply with regulatory requirements and ensure platform security, EquiXtate requires
            all investors to complete a KYC verification process before investing.
          </p>
        </div>
      </div>
    </>
  );
};

export default RegistrationStepOne;
