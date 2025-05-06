
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, UserCheck, X } from "lucide-react";

const RegistrationStepTwo: React.FC = () => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdDocument(e.target.files[0]);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieImage(e.target.files[0]);
    }
  };

  const removeIdDocument = () => {
    setIdDocument(null);
    // Reset the input value
    const input = document.getElementById('id-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const removeSelfieImage = () => {
    setSelfieImage(null);
    // Reset the input value
    const input = document.getElementById('selfie') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="id-upload" className="flex items-center">
            Upload Government ID <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="border-2 border-dashed border-space-neon-blue/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-blue transition-colors">
            {idDocument ? (
              <div className="bg-space-black/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-space-neon-blue/20 p-2 rounded-md mr-3">
                      <Upload className="h-5 w-5 text-space-neon-blue" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-white font-medium truncate">{idDocument.name}</p>
                      <p className="text-xs text-gray-400">{(idDocument.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={removeIdDocument}
                    className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-space-deep-purple/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500">Passport, Driver's License, or National ID</p>
                <Input id="id-upload" type="file" className="hidden" onChange={handleIdUpload} />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('id-upload')?.click()}
                  variant="outline" 
                  className="mt-2 border-space-neon-blue text-space-neon-blue"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload ID
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="selfie" className="flex items-center">
            Upload Selfie/Biometric Photo <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="border-2 border-dashed border-space-neon-purple/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-purple transition-colors">
            {selfieImage ? (
              <div className="bg-space-black/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-space-neon-purple/20 p-2 rounded-md mr-3">
                      <Upload className="h-5 w-5 text-space-neon-purple" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-white font-medium truncate">{selfieImage.name}</p>
                      <p className="text-xs text-gray-400">{(selfieImage.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={removeSelfieImage}
                    className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-space-deep-purple/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500">Clear photo of your face for verification</p>
                <Input id="selfie" type="file" className="hidden" onChange={handleSelfieUpload} accept="image/*" />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('selfie')?.click()}
                  variant="outline" 
                  className="mt-2 border-space-neon-purple text-space-neon-purple"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Selfie
                </Button>
              </>
            )}
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
