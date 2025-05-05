
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, UserCheck } from "lucide-react";

const RegistrationStepTwo: React.FC = () => {
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="id-upload">Upload Government ID</Label>
          <div className="border-2 border-dashed border-space-neon-blue/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-blue transition-colors">
            <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
            <p className="text-xs text-gray-500">Passport, Driver's License, or National ID</p>
            <Input id="id-upload" type="file" className="hidden" />
            <Button 
              type="button" 
              onClick={() => document.getElementById('id-upload')?.click()}
              variant="outline" 
              className="mt-2 border-space-neon-blue text-space-neon-blue"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload ID
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="selfie">Upload Selfie/Biometric Photo</Label>
          <div className="border-2 border-dashed border-space-neon-purple/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-purple transition-colors">
            <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
            <p className="text-xs text-gray-500">Clear photo of your face for verification</p>
            <Input id="selfie" type="file" className="hidden" />
            <Button 
              type="button" 
              onClick={() => document.getElementById('selfie')?.click()}
              variant="outline" 
              className="mt-2 border-space-neon-purple text-space-neon-purple"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Selfie
            </Button>
          </div>
        </div>
        
        <div className="bg-space-deep-purple/30 p-4 rounded-lg border border-space-neon-green/30">
          <h4 className="text-sm font-medium text-space-neon-green flex items-center mb-2">
            <UserCheck className="h-4 w-4 mr-2" />
            Secure Verification Process
          </h4>
          <p className="text-xs text-gray-400">
            Your identity documents are processed using secure, encrypted channels and are
            verified through trusted third-party services to ensure maximum protection.
          </p>
        </div>
      </div>
    </>
  );
};

export default RegistrationStepTwo;
