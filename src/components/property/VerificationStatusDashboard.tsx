/**
 * Verification Status Dashboard Component
 * 
 * Displays verification progress for properties and users
 * Shows KRNL attestations and verification history
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  ExternalLink,
  FileText,
  User
} from 'lucide-react';
import PropertyOnboardingService, { PropertyOnboarding, OnboardingStatus } from '@/services/PropertyOnboardingService';
import UserOnboardingService, { UserOnboarding, UserVerificationStatus } from '@/services/UserOnboardingService';
import { VerificationStatus } from '@/services/KRNLVerificationService';
import { useWallet } from '@/hooks/useWallet';

interface VerificationStatusDashboardProps {
  walletAddress?: string;
}

const VerificationStatusDashboard: React.FC<VerificationStatusDashboardProps> = ({
  walletAddress: propWalletAddress
}) => {
  const { address } = useWallet();
  const walletAddress = propWalletAddress || address;
  
  const [propertyOnboardings, setPropertyOnboardings] = useState<PropertyOnboarding[]>([]);
  const [userOnboarding, setUserOnboarding] = useState<UserOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      loadData();
    }
  }, [walletAddress]);

  const loadData = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      const properties = await PropertyOnboardingService.getWalletOnboardings(walletAddress);
      const user = await UserOnboardingService.getUserOnboarding(walletAddress);
      
      setPropertyOnboardings(properties);
      setUserOnboarding(user);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: OnboardingStatus | UserVerificationStatus | VerificationStatus): string => {
    const statusStr = String(status);
    
    // Verified/Complete statuses
    if (statusStr.includes('verified') || statusStr === OnboardingStatus.LISTED || statusStr === OnboardingStatus.VERIFICATION_COMPLETE) {
      return 'bg-green-500';
    }
    
    // In progress statuses
    if (statusStr.includes('in_progress')) {
      return 'bg-blue-500';
    }
    
    // Pending statuses
    if (statusStr.includes('pending') || statusStr === VerificationStatus.REQUIRES_REVIEW) {
      return 'bg-yellow-500';
    }
    
    // Rejected statuses
    if (statusStr.includes('rejected')) {
      return 'bg-red-500';
    }
    
    return 'bg-gray-500';
  };

  const getStatusIcon = (status: OnboardingStatus | UserVerificationStatus | VerificationStatus) => {
    const statusStr = String(status);
    
    if (statusStr.includes('verified') || statusStr === OnboardingStatus.LISTED || statusStr === OnboardingStatus.VERIFICATION_COMPLETE) {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    if (statusStr.includes('progress')) {
      return <Clock className="h-4 w-4 animate-spin" />;
    }
    if (statusStr.includes('pending') || statusStr === VerificationStatus.REQUIRES_REVIEW) {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (statusStr.includes('rejected')) {
      return <XCircle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!walletAddress) {
    return (
      <Card className="glassmorphism border-space-neon-blue/30">
        <CardHeader>
          <CardTitle className="font-orbitron">Verification Dashboard</CardTitle>
          <CardDescription>Connect your wallet to view verification status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="glassmorphism border-space-neon-blue/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Clock className="h-8 w-8 animate-spin text-space-neon-blue mr-3" />
            <span className="text-gray-300">Loading verification data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphism border-space-neon-blue/30">
      <CardHeader>
        <CardTitle className="font-orbitron flex items-center">
          <Shield className="h-6 w-6 mr-2 text-space-neon-blue" />
          Verification Dashboard
        </CardTitle>
        <CardDescription>
          Track your KRNL verification status and history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="user" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              User KYC
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Properties ({propertyOnboardings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            {userOnboarding ? (
              <div className="space-y-4">
                <div className="bg-space-deep-purple/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">KYC Status</h3>
                    <Badge className={`${getStatusColor(userOnboarding.status)} text-white`}>
                      {getStatusIcon(userOnboarding.status)}
                      <span className="ml-2">{userOnboarding.status.replace(/_/g, ' ').toUpperCase()}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">KYC Tier</p>
                      <p className="text-white font-medium">{['None', 'Basic', 'Standard', 'Enhanced'][userOnboarding.tier]}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Max Investment</p>
                      <p className="text-white font-medium">
                        {userOnboarding.investmentLimits.maxInvestmentAmount === Infinity 
                          ? 'Unlimited' 
                          : `$${userOnboarding.investmentLimits.maxInvestmentAmount.toLocaleString()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Can List Properties</p>
                      <p className={`font-medium ${userOnboarding.investmentLimits.canListProperties ? 'text-green-400' : 'text-gray-400'}`}>
                        {userOnboarding.investmentLimits.canListProperties ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Governance Rights</p>
                      <p className={`font-medium ${userOnboarding.investmentLimits.canParticipateInGovernance ? 'text-green-400' : 'text-gray-400'}`}>
                        {userOnboarding.investmentLimits.canParticipateInGovernance ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {userOnboarding.verification && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Verification Details</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Verification ID:</span>
                          <span className="text-white font-mono text-xs">{userOnboarding.verification.verificationId}</span>
                        </div>
                        {userOnboarding.verification.result?.attestationHash && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Attestation Hash:</span>
                            <span className="text-white font-mono text-xs truncate max-w-[200px]">
                              {userOnboarding.verification.result.attestationHash}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Submitted:</span>
                          <span className="text-white">{formatDate(userOnboarding.verification.submittedAt)}</span>
                        </div>
                        {userOnboarding.verification.completedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Completed:</span>
                            <span className="text-white">{formatDate(userOnboarding.verification.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {userOnboarding.compliance && (
                  <div className="bg-space-deep-purple/30 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-white mb-3">Compliance Checks</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">AML Screening</span>
                        <Badge className={userOnboarding.compliance.amlCheckPassed ? 'bg-green-500' : 'bg-red-500'}>
                          {userOnboarding.compliance.amlCheckPassed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Sanctions Screening</span>
                        <Badge className={userOnboarding.compliance.sanctionScreeningPassed ? 'bg-green-500' : 'bg-red-500'}>
                          {userOnboarding.compliance.sanctionScreeningPassed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No KYC verification found</p>
                <Button className="cosmic-btn">
                  Start KYC Verification
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="properties">
            {propertyOnboardings.length > 0 ? (
              <div className="space-y-4">
                {propertyOnboardings.map((property) => (
                  <div key={property.id} className="bg-space-deep-purple/30 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{property.propertyData.name}</h3>
                        <p className="text-sm text-gray-400">{property.propertyData.location}</p>
                      </div>
                      <Badge className={`${getStatusColor(property.status)} text-white`}>
                        {getStatusIcon(property.status)}
                        <span className="ml-2">{property.status.replace(/_/g, ' ').toUpperCase()}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-400">Property Value</p>
                        <p className="text-white font-medium">${property.propertyData.price.toLocaleString()} USDC</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Property Type</p>
                        <p className="text-white font-medium capitalize">{property.propertyData.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Submitted</p>
                        <p className="text-white">{formatDate(property.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Updated</p>
                        <p className="text-white">{formatDate(property.updatedAt)}</p>
                      </div>
                    </div>

                    {property.verification && (
                      <div className="pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">KRNL Verification Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Verification ID:</span>
                            <span className="text-white font-mono text-xs">{property.verification.verificationId}</span>
                          </div>
                          {property.verification.result?.attestationHash && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Attestation:</span>
                              <div className="flex items-center">
                                <span className="text-white font-mono text-xs truncate max-w-[150px]">
                                  {property.verification.result.attestationHash}
                                </span>
                                <Button variant="ghost" size="sm" className="ml-2 p-1 h-6">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {property.verification.result?.details && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div className="flex items-center">
                                <CheckCircle2 className={`h-4 w-4 mr-2 ${property.verification.result.details.ownershipVerified ? 'text-green-500' : 'text-gray-500'}`} />
                                <span className="text-gray-400 text-xs">Ownership Verified</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle2 className={`h-4 w-4 mr-2 ${property.verification.result.details.documentAuthenticity ? 'text-green-500' : 'text-gray-500'}`} />
                                <span className="text-gray-400 text-xs">Documents Authentic</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle2 className={`h-4 w-4 mr-2 ${property.verification.result.details.governmentRecordMatch ? 'text-green-500' : 'text-gray-500'}`} />
                                <span className="text-gray-400 text-xs">Gov Records Match</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle2 className={`h-4 w-4 mr-2 ${property.verification.result.details.crossChainAttestation ? 'text-green-500' : 'text-gray-500'}`} />
                                <span className="text-gray-400 text-xs">Cross-Chain Attested</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {property.tokenization && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Tokenization Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Contract:</span>
                            <span className="text-white font-mono text-xs truncate max-w-[200px]">
                              {property.tokenization.contractAddress}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Token ID:</span>
                            <span className="text-white">{property.tokenization.tokenId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Tokens:</span>
                            <span className="text-white">{property.tokenization.totalTokens?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No properties submitted yet</p>
                <Button className="cosmic-btn">
                  List Your First Property
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VerificationStatusDashboard;
