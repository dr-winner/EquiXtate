
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

interface RegistrationStepOneProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

const RegistrationStepOne: React.FC<RegistrationStepOneProps> = ({ 
  email, 
  setEmail, 
  password, 
  setPassword 
}) => {
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
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input 
            id="confirm-password" 
            type="password" 
            placeholder="••••••••" 
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
          />
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
