
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const RegistrationStepThree: React.FC = () => {
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);

  const handleAddressProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAddressProofFile(e.target.files[0]);
    }
  };

  const removeAddressProofFile = () => {
    setAddressProofFile(null);
    // Reset the input value
    const input = document.getElementById('address-proof') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address-proof" className="flex items-center">
            Upload Address Proof <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="border-2 border-dashed border-space-neon-green/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-green transition-colors">
            {addressProofFile ? (
              <div className="bg-space-black/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-space-neon-green/20 p-2 rounded-md mr-3">
                      <Upload className="h-5 w-5 text-space-neon-green" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-white font-medium truncate">{addressProofFile.name}</p>
                      <p className="text-xs text-gray-400">{(addressProofFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={removeAddressProofFile}
                    className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-space-deep-purple/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500">Utility bill, bank statement or official letter (less than 3 months old)</p>
                <Input id="address-proof" type="file" className="hidden" onChange={handleAddressProofUpload} />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('address-proof')?.click()}
                  variant="outline" 
                  className="mt-2 border-space-neon-green text-space-neon-green"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center">
            Full Address <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="address" 
            placeholder="Enter your full address" 
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center">
            Phone Number <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="phone" 
            placeholder="Enter your phone number" 
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="terms" required />
          <Label htmlFor="terms" className="text-sm flex items-center">
            I confirm all information provided is accurate and consent to KYC verification
            <span className="text-red-500 ml-1">*</span>
          </Label>
        </div>
      </div>
    </>
  );
};

export default RegistrationStepThree;
