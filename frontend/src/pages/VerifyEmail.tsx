import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

const VerifyEmail: React.FC = () => {
  const { verifyEmail, user } = useAuth();
  const [, setLocation] = useLocation();
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailToVerify = searchParams.get('email') || undefined;
    
    verifyEmail(emailToVerify);
    setVerified(true);
    setTimeout(() => {
      setLocation('/women');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-none p-8 text-center shadow-2xl">
        <h1 className="text-3xl font-serif text-[#F5F0EB] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
          {verified ? 'Email Verified' : 'Verify Your Email'}
        </h1>
        
        {verified ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center border border-green-500/50">
                <span className="text-green-500 text-3xl">✓</span>
              </div>
            </div>
            <p className="text-[#A0A0A0]">Thank you for verifying your email. Redirecting you to the shop...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-[#A0A0A0]">Click the button below to complete your registration and verify your email address.</p>
            <Button 
              onClick={handleVerify}
              className="w-full bg-[#C9A84C] hover:bg-[#B0923D] text-black font-bold h-12 rounded-none transition-all duration-300 uppercase tracking-widest text-xs"
            >
              Verify My Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
