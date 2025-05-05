
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input 
            id="login-email" 
            type="email" 
            placeholder="you@example.com" 
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <Input 
            id="login-password" 
            type="password" 
            placeholder="••••••••" 
            className="bg-space-deep-purple/30 border-space-neon-blue/30"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="remember" />
            <Label htmlFor="remember" className="text-sm">Remember me</Label>
          </div>
          <a href="#" className="text-space-neon-blue text-sm hover:underline">Forgot password?</a>
        </div>
        <Button 
          type="submit" 
          className="w-full cosmic-btn" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign In
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
