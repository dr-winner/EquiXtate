
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronRight, FileImage, FileText, Loader2, MapPin, Upload, X, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PropertyOnboardingService, { OnboardingSubmission } from '@/services/PropertyOnboardingService';
import UserOnboardingService from '@/services/UserOnboardingService';
import { useWallet } from '@/hooks/useWallet';

interface PropertyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const PropertyUploadModal: React.FC<PropertyUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const totalSteps = 3;
  
  // Safely get wallet address with fallback
  const wallet = useWallet();
  const address = wallet?.address || wallet?.walletAddress || '';
  
  // Form state
  const [propertyData, setPropertyData] = useState({
    name: '',
    type: '',
    location: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    listingType: 'sale', // 'sale', 'auction', 'rent'
  });
  
  // Files state
  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [propertyDocuments, setPropertyDocuments] = useState<File[]>([]);
  const [deedDocument, setDeedDocument] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setPropertyData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPropertyImages(prev => [...prev, ...files]);
    }
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPropertyDocuments(prev => [...prev, ...files]);
    }
  };
  
  const handleDeedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDeedDocument(e.target.files[0]);
    }
  };
  
  const removeImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeDocument = (index: number) => {
    setPropertyDocuments(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeDeedDocument = () => {
    setDeedDocument(null);
    // Reset the input value
    const input = document.getElementById('deed') as HTMLInputElement;
    if (input) input.value = '';
  };
  
  const moveToNextStep = () => {
    // Validation for each step
    if (currentStep === 1) {
      // Check required fields in step 1
      if (!propertyData.name || !propertyData.type || !propertyData.location || !propertyData.price) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields marked with *",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 2) {
      // Check if images are uploaded
      if (propertyImages.length < 1) {
        toast({
          title: "Images Required",
          description: "Please upload at least one property image",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const moveToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleCancel = () => {
    // Reset form state to initial values
    setCurrentStep(1);
    setPropertyData({
      name: '',
      type: '',
      location: '',
      description: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      squareFootage: '',
      listingType: 'sale',
    });
    setPropertyImages([]);
    setPropertyDocuments([]);
    setDeedDocument(null);
    setTermsAccepted(false);
    onClose();
  };
  
  const handleSubmit = async () => {
    // Validation for final step
    if (!deedDocument) {
      toast({
        title: "Missing Document",
        description: "Property deed document is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please confirm that you're the legal owner of this property",
        variant: "destructive"
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit property",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Step 1: Check if user is verified and can list properties
      const canList = await UserOnboardingService.canUserListProperty(address);
      if (!canList.allowed) {
        toast({
          title: "KYC Verification Required",
          description: canList.reason || "Please complete Enhanced KYC verification to list properties",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Create property onboarding submission
      const submission: OnboardingSubmission = {
        ownerAddress: address,
        propertyData: {
          name: propertyData.name,
          type: propertyData.type,
          location: propertyData.location,
          description: propertyData.description,
          price: parseFloat(propertyData.price),
          bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : undefined,
          bathrooms: propertyData.bathrooms ? parseFloat(propertyData.bathrooms) : undefined,
          squareFootage: propertyData.squareFootage ? parseInt(propertyData.squareFootage) : undefined,
          listingType: propertyData.listingType as 'sale' | 'auction' | 'rent'
        },
        images: propertyImages,
        documents: propertyDocuments,
        deedDocument: deedDocument
      };

      // Step 3: Create onboarding record
      const onboarding = await PropertyOnboardingService.createOnboarding(submission);
      
      toast({
        title: "Property Submitted",
        description: "Your property has been submitted for processing",
      });

      // Step 4: Start KRNL verification process
      setVerificationInProgress(true);
      
      toast({
        title: "🔍 Verification Started",
        description: "KRNL Protocol is verifying your property ownership...",
      });

      const verificationResult = await PropertyOnboardingService.submitForVerification(
        onboarding.id
      );

      setVerificationInProgress(false);

      if (verificationResult.success) {
        toast({
          title: "✅ Verification Successful",
          description: "Your property has been verified! Proceeding to tokenization...",
        });

        // Step 5: Tokenize the property
        const tokenizationResult = await PropertyOnboardingService.tokenizeProperty(
          onboarding.id
        );

        if (tokenizationResult.success) {
          toast({
            title: "🎉 Property Listed!",
            description: `Your property has been tokenized and listed on the marketplace.`,
          });
          
          onUploadSuccess();
          handleCancel();
        } else {
          toast({
            title: "Tokenization Pending",
            description: "Property verified but tokenization will be completed shortly.",
          });
        }
      } else {
        toast({
          title: "⏳ Manual Review Required",
          description: "Your property requires additional verification by our validators. You'll be notified within 24-48 hours.",
        });
        
        onUploadSuccess();
        handleCancel();
      }
      
    } catch (error) {
      console.error('Error uploading property:', error);
      setVerificationInProgress(false);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading your property. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render step indicators
  const renderStepIndicators = () => (
    <div className="flex justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div 
          key={index}
          className={`h-2 w-2 rounded-full ${
            currentStep > index + 1 
              ? "bg-space-neon-green" 
              : currentStep === index + 1 
                ? "bg-space-neon-blue" 
                : "bg-gray-500"
          }`}
        />
      ))}
    </div>
  );
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Property Details
        return (
          <>
            <h2 className="text-2xl font-orbitron mb-6">Property Details</h2>
            <p className="text-sm text-gray-400 mb-6">
              Provide basic information about your property for tokenization.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  Property Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="name" 
                  name="name"
                  value={propertyData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Modern Downtown Apartment"
                  className="bg-space-deep-purple/30 border-space-neon-blue/30"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center">
                    Property Type <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select 
                    value={propertyData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                    required
                  >
                    <SelectTrigger className="bg-space-deep-purple/30 border-space-neon-blue/30">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="listingType" className="flex items-center">
                    Listing Type <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select 
                    value={propertyData.listingType} 
                    onValueChange={(value) => handleSelectChange('listingType', value)}
                    required
                  >
                    <SelectTrigger className="bg-space-deep-purple/30 border-space-neon-blue/30">
                      <SelectValue placeholder="Select listing type" />
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="auction">Auction</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  Location <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input 
                    id="location" 
                    name="location"
                    value={propertyData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. 123 Main St, Accra, Ghana"
                    className="bg-space-deep-purple/30 border-space-neon-blue/30 pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center">
                  Property Value (in USDC) <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="price" 
                  name="price"
                  type="number"
                  value={propertyData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. 100000"
                  className="bg-space-deep-purple/30 border-space-neon-blue/30"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">
                    Bedrooms
                  </Label>
                  <Input 
                    id="bedrooms" 
                    name="bedrooms"
                    type="number"
                    value={propertyData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="e.g. 2"
                    className="bg-space-deep-purple/30 border-space-neon-blue/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">
                    Bathrooms
                  </Label>
                  <Input 
                    id="bathrooms" 
                    name="bathrooms"
                    type="number"
                    value={propertyData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="e.g. 2"
                    className="bg-space-deep-purple/30 border-space-neon-blue/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="squareFootage">
                    Square Footage
                  </Label>
                  <Input 
                    id="squareFootage" 
                    name="squareFootage"
                    type="number"
                    value={propertyData.squareFootage}
                    onChange={handleInputChange}
                    placeholder="e.g. 1000"
                    className="bg-space-deep-purple/30 border-space-neon-blue/30"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description
                </Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={propertyData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the property..."
                  className="bg-space-deep-purple/30 border-space-neon-blue/30 min-h-[100px]"
                />
              </div>
            </div>
          </>
        );
        
      case 2: // Media Upload
        return (
          <>
            <h2 className="text-2xl font-orbitron mb-6">Media & Documentation</h2>
            <p className="text-sm text-gray-400 mb-6">
              Upload high-quality images and video walkthroughs of your property.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="images" className="flex items-center">
                  Property Images <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="border-2 border-dashed border-space-neon-blue/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-blue transition-colors">
                  {propertyImages.length > 0 ? (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-space-neon-green">
                          {propertyImages.length} image(s) uploaded
                        </p>
                        <Button 
                          type="button" 
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('images')?.click()}
                          className="border-space-neon-blue text-space-neon-blue"
                        >
                          <Upload className="mr-1 h-3 w-3" /> Add More
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {propertyImages.map((image, idx) => (
                          <div key={idx} className="relative group h-24 bg-space-deep-purple/50 rounded overflow-hidden">
                            <img 
                              src={URL.createObjectURL(image)}
                              alt={`Property ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="bg-red-500/70 hover:bg-red-500 p-1 rounded-full"
                              >
                                <X className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
                      <p className="text-xs text-gray-500 mb-2">Upload high-quality images (.jpg, .png)</p>
                      <Button 
                        type="button" 
                        onClick={() => document.getElementById('images')?.click()}
                        variant="outline" 
                        className="mt-2 border-space-neon-blue text-space-neon-blue"
                      >
                        <Upload className="mr-2 h-4 w-4" /> Select Files
                      </Button>
                    </>
                  )}
                  <Input id="images" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documents">
                  Supporting Documents
                </Label>
                <div className="border-2 border-dashed border-space-neon-purple/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-purple transition-colors">
                  {propertyDocuments.length > 0 ? (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-space-neon-green">
                          {propertyDocuments.length} document(s) uploaded
                        </p>
                        <Button 
                          type="button" 
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('documents')?.click()}
                          className="border-space-neon-purple text-space-neon-purple"
                        >
                          <Upload className="mr-1 h-3 w-3" /> Add More
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {propertyDocuments.map((doc, idx) => (
                          <div key={idx} className="bg-space-black/50 p-3 rounded-lg flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-space-neon-purple/20 p-2 rounded-md mr-3">
                                <FileText className="h-4 w-4 text-space-neon-purple" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm text-white truncate max-w-[200px]">{doc.name}</p>
                                <p className="text-xs text-gray-400">{(doc.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeDocument(idx)}
                              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-space-deep-purple/50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
                      <p className="text-xs text-gray-500 mb-2">Upload property tax records, floor plans, etc. (.pdf, .doc)</p>
                      <Button 
                        type="button" 
                        onClick={() => document.getElementById('documents')?.click()}
                        variant="outline" 
                        className="mt-2 border-space-neon-purple text-space-neon-purple"
                      >
                        <Upload className="mr-2 h-4 w-4" /> Select Files
                      </Button>
                    </>
                  )}
                  <Input id="documents" type="file" multiple accept=".pdf,.doc,.docx" onChange={handleDocumentUpload} className="hidden" />
                </div>
              </div>
            </div>
          </>
        );
        
      case 3: // Legal Verification
        return (
          <>
            <h2 className="text-2xl font-orbitron mb-6">Legal Verification</h2>
            <p className="text-sm text-gray-400 mb-6">
              Provide legal documentation to verify property ownership.
            </p>

            <div className="mb-4 bg-space-deep-purple/30 border border-space-neon-blue/30 p-3 rounded-lg text-sm text-gray-200">
              Your identity from KYC is already on file. Here we only need property ownership documents—no duplicate personal info.
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deed" className="flex items-center">
                  Property Deed Document <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="border-2 border-dashed border-space-neon-green/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-green transition-colors">
                  {deedDocument ? (
                    <div className="bg-space-black/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-space-neon-green/20 p-2 rounded-md mr-3">
                            <FileText className="h-5 w-5 text-space-neon-green" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-white font-medium truncate">{deedDocument.name}</p>
                            <p className="text-xs text-gray-400">{(deedDocument.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={removeDeedDocument}
                          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-space-deep-purple/50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-400 mb-2">Upload legal deed documentation</p>
                      <p className="text-xs text-gray-500 mb-2">This will be verified with government land records</p>
                      <Input id="deed" type="file" accept=".pdf,.doc,.docx" onChange={handleDeedUpload} className="hidden" />
                      <Button 
                        type="button" 
                        onClick={() => document.getElementById('deed')?.click()}
                        variant="outline"
                        className="border-space-neon-green text-space-neon-green"
                      >
                        <Upload className="mr-2 h-4 w-4" /> Upload Deed
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mt-6 bg-space-deep-purple/30 p-4 rounded-lg">
                <h3 className="font-medium text-space-neon-blue flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  KRNL Protocol Verification
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-space-neon-green mt-0.5" />
                    <span>KRNL Protocol will automatically query government databases to verify ownership</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-space-neon-green mt-0.5" />
                    <span>Document authenticity will be verified through cryptographic attestation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-space-neon-green mt-0.5" />
                    <span>Cross-chain property data attestation ensures immutable verification records</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-space-neon-green mt-0.5" />
                    <span>Upon approval, smart contracts will mint the appropriate EquiX tokens</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-space-neon-green mt-0.5" />
                    <span>You'll be notified once your property is tokenized and listed</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mr-2" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <Label htmlFor="terms" className="text-sm flex items-center">
                  I confirm that all information provided is accurate and I am the legal owner of this property
                  <span className="text-red-500 ml-1">*</span>
                </Label>
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
          onClick={handleCancel}
        >
          <div 
            className="relative w-full max-w-[600px] mx-4 glassmorphism border-space-neon-blue/30 rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCancel} 
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-space-deep-purple/50 transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>

            <div>
              {renderStepIndicators()}
              {renderStepContent()}
            </div>
            
            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={moveToPreviousStep}
                  className="border-space-neon-blue text-space-neon-blue"
                >
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button 
                  type="button"
                  onClick={moveToNextStep}
                  className="cosmic-btn ml-auto"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || verificationInProgress}
                  className="cosmic-btn ml-auto"
                >
                  {isLoading || verificationInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {verificationInProgress ? 'Verifying via KRNL...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify & Submit
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyUploadModal;
