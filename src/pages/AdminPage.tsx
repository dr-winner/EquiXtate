
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WalletService from '@/services/web3/WalletService';

// List of admin wallet addresses (can be expanded)
const ADMIN_ADDRESSES: string[] = [
  "0x9CA25259DAde7Bce58e5294A8F08CAA69fD59f6D",
  // Add more admin addresses here
];

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);
        const isWalletConnected = await WalletService.isWalletConnected();
        
        if (!isWalletConnected) {
          setIsAdmin(false);
          toast({
            title: "Access Denied",
            description: "Please connect your wallet to access admin features.",
            variant: "destructive"
          });
          return;
        }
        
        const walletAddress = await WalletService.getWalletAddress();
        
        if (!walletAddress) {
          setIsAdmin(false);
          return;
        }
        
        // Check if the connected wallet is an admin wallet
        const hasAdminAccess = ADMIN_ADDRESSES.some(
          addr => addr.toLowerCase() === walletAddress.toLowerCase()
        );
        
        setIsAdmin(hasAdminAccess);
        
        if (!hasAdminAccess) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, []);
  
  // If still checking admin status, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-space-black to-space-deep-purple flex flex-col items-center justify-center">
        <div className="animate-pulse text-space-neon-blue text-2xl">Verifying admin access...</div>
      </div>
    );
  }
  
  // If not an admin, redirect to home
  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-space-black to-space-deep-purple flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="glassmorphism rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              Admin Access
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-xl font-bold text-white mb-4">Property Submissions</h2>
              <div className="text-3xl font-bold text-space-neon-blue mb-2">8</div>
              <p className="text-gray-400 mb-4">Pending review</p>
              <button className="w-full bg-space-neon-blue/20 hover:bg-space-neon-blue/30 text-space-neon-blue py-2 rounded-lg transition-colors">
                View Submissions
              </button>
            </div>
            
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-xl font-bold text-white mb-4">KYC Verifications</h2>
              <div className="text-3xl font-bold text-space-neon-blue mb-2">12</div>
              <p className="text-gray-400 mb-4">Awaiting verification</p>
              <button className="w-full bg-space-neon-blue/20 hover:bg-space-neon-blue/30 text-space-neon-blue py-2 rounded-lg transition-colors">
                Review Verifications
              </button>
            </div>
            
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-xl font-bold text-white mb-4">Contract Management</h2>
              <p className="text-gray-400 mb-4">Update contract parameters</p>
              <button className="w-full bg-space-neon-blue/20 hover:bg-space-neon-blue/30 text-space-neon-blue py-2 rounded-lg transition-colors">
                Manage Contracts
              </button>
            </div>
            
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-xl font-bold text-white mb-4">Admin Management</h2>
              <p className="text-gray-400 mb-4">Manage admin accounts</p>
              <button className="w-full bg-space-neon-blue/20 hover:bg-space-neon-blue/30 text-space-neon-blue py-2 rounded-lg transition-colors">
                Manage Admins
              </button>
            </div>
            
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-xl font-bold text-white mb-4">Platform Analytics</h2>
              <p className="text-gray-400 mb-4">View platform performance metrics</p>
              <button className="w-full bg-space-neon-blue/20 hover:bg-space-neon-blue/30 text-space-neon-blue py-2 rounded-lg transition-colors">
                View Analytics
              </button>
            </div>
            
            <div className="bg-space-deep-purple/30 p-6 rounded-lg border border-space-neon-blue/30">
              <h2 className="text-xl font-bold text-white mb-4">System Settings</h2>
              <p className="text-gray-400 mb-4">Update platform configuration</p>
              <button className="w-full bg-space-neon-blue/20 hover:bg-space-neon-blue/30 text-space-neon-blue py-2 rounded-lg transition-colors">
                Edit Settings
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
