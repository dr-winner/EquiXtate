
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronRight, FileImage, FileText, Loader2, MapPin, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const totalSteps = 3;
  
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
  
  const moveToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const moveToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Simulated API call or blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Verification in Progress",
        description: "Your property is being verified and will be tokenized upon approval.",
      });
      
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading property:', error);
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
            <DialogTitle className="text-2xl font-orbitron mb-6">Property Details</DialogTitle>
            <DialogDescription className="mb-6">
              Provide basic information about your property for tokenization.
            </DialogDescription>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={propertyData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Modern Downtown Apartment"
                  className="bg-space-deep-purple/30 border-space-neon-blue/30"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Select 
                    value={propertyData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger className="bg-space-deep-purple/30 border-space-neon-blue/30">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="listingType">Listing Type</Label>
                  <Select 
                    value={propertyData.listingType} 
                    onValueChange={(value) => handleSelectChange('listingType', value)}
                  >
                    <SelectTrigger className="bg-space-deep-purple/30 border-space-neon-blue/30">
                      <SelectValue placeholder="Select listing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="auction">Auction</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input 
                    id="location" 
                    name="location"
                    value={propertyData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. 123 Main St, Accra, Ghana"
                    className="bg-space-deep-purple/30 border-space-neon-blue/30 pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Property Value (in USDC)</Label>
                <Input 
                  id="price" 
                  name="price"
                  type="number"
                  value={propertyData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. 100000"
                  className="bg-space-deep-purple/30 border-space-neon-blue/30"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
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
                  <Label htmlFor="bathrooms">Bathrooms</Label>
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
                  <Label htmlFor="squareFootage">Square Footage</Label>
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
                <Label htmlFor="description">Description</Label>
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
            <DialogTitle className="text-2xl font-orbitron mb-6">Media & Documentation</DialogTitle>
            <DialogDescription className="mb-6">
              Upload high-quality images and video walkthroughs of your property.
            </DialogDescription>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="images">Property Images (min. 5)</Label>
                <div className="border-2 border-dashed border-space-neon-blue/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-blue transition-colors">
                  <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
                  <p className="text-xs text-gray-500 mb-2">Upload high-quality images (.jpg, .png)</p>
                  
                  <Input id="images" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button 
                    type="button" 
                    onClick={() => document.getElementById('images')?.click()}
                    variant="outline"
                    className="border-space-neon-blue text-space-neon-blue"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Select Files
                  </Button>
                  
                  {propertyImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-space-neon-green mb-2">
                        {propertyImages.length} image(s) selected
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {propertyImages.slice(0, 3).map((image, idx) => (
                          <div key={idx} className="relative h-16 bg-space-deep-purple/50 rounded overflow-hidden">
                            <img 
                              src={URL.createObjectURL(image)}
                              alt={`Property ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        {propertyImages.length > 3 && (
                          <div className="h-16 flex items-center justify-center bg-space-deep-purple/50 rounded">
                            <span className="text-sm">+{propertyImages.length - 3} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documents">Supporting Documents</Label>
                <div className="border-2 border-dashed border-space-neon-purple/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-purple transition-colors">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-400 mb-2">Drag and drop or click to upload</p>
                  <p className="text-xs text-gray-500 mb-2">Upload property tax records, floor plans, etc. (.pdf, .doc)</p>
                  
                  <Input id="documents" type="file" multiple accept=".pdf,.doc,.docx" onChange={handleDocumentUpload} className="hidden" />
                  <Button 
                    type="button" 
                    onClick={() => document.getElementById('documents')?.click()}
                    variant="outline"
                    className="border-space-neon-purple text-space-neon-purple"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Select Files
                  </Button>
                  
                  {propertyDocuments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-space-neon-green">
                        {propertyDocuments.length} document(s) selected
                      </p>
                      <ul className="text-left text-xs mt-2 space-y-1">
                        {propertyDocuments.slice(0, 3).map((doc, idx) => (
                          <li key={idx} className="text-gray-300">
                            <Check className="inline-block h-3 w-3 mr-1 text-space-neon-green" /> {doc.name}
                          </li>
                        ))}
                        {propertyDocuments.length > 3 && (
                          <li className="text-gray-300">+ {propertyDocuments.length - 3} more files</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
        
      case 3: // Legal Verification
        return (
          <>
            <DialogTitle className="text-2xl font-orbitron mb-6">Legal Verification</DialogTitle>
            <DialogDescription className="mb-6">
              Provide legal documentation to verify property ownership.
            </DialogDescription>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deed" className="flex items-center">
                  Property Deed Document <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="border-2 border-dashed border-space-neon-green/50 rounded-lg p-6 text-center cursor-pointer hover:border-space-neon-green transition-colors">
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
                  
                  {deedDocument && (
                    <div className="mt-4">
                      <p className="text-sm text-space-neon-green flex items-center justify-center">
                        <Check className="h-4 w-4 mr-1" /> {deedDocument.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mt-6 bg-space-deep-purple/30 p-4 rounded-lg">
                <h3 className="font-medium text-space-neon-blue">Verification Process</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-space-neon-green mt-0.5" />
                    <span>Our system will automatically query government databases to verify ownership</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-space-neon-green mt-0.5" />
                    <span>EquiXtate validators will review all submitted documentation</span>
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
                <input type="checkbox" id="terms" className="mr-2" />
                <Label htmlFor="terms" className="text-sm">
                  I confirm that all information provided is accurate and I am the legal owner of this property
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] glassmorphism border-space-neon-blue/30">
        <DialogHeader>
          {renderStepIndicators()}
          {renderStepContent()}
        </DialogHeader>
        
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
              disabled={isLoading}
              className="cosmic-btn ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Verification
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyUploadModal;
