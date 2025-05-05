
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const RegistrationStepThree: React.FC = () => {
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address-proof">Upload Address Proof</Label>
          <div className="border-2 border-dashed border-space-neon-green/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-green transition-colors">
            <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
            <p className="text-xs text-gray-500">Utility bill, bank statement or official letter (less than 3 months old)</p>
            <Input id="address-proof" type="file" className="hidden" />
            <Button 
              type="button" 
              onClick={() => document.getElementById('address-proof')?.click()}
              variant="outline" 
              className="mt-2 border-space-neon-green text-space-neon-green"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Input 
            id="address" 
            placeholder="Enter your full address" 
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            placeholder="Enter your phone number" 
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="terms" />
          <Label htmlFor="terms" className="text-sm">
            I confirm all information provided is accurate and consent to KYC verification
          </Label>
        </div>
      </div>
    </>
  );
};

export default RegistrationStepThree;
