import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sendEmail = trpc.email.sendVerification.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      const res = await sendEmail.mutateAsync({ email: formData.email });
      if (res.previewUrl) {
        console.log("Verification email preview:", res.previewUrl);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-none p-8 text-center shadow-2xl">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-[#C9A84C]/20 rounded-full flex items-center justify-center border border-[#C9A84C]/50">
              <span className="text-[#C9A84C] text-3xl">✓</span>
            </div>
          </div>
          <h1 className="text-2xl font-serif text-[#F5F0EB] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Check Your Email</h1>
          <p className="text-[#A0A0A0] text-sm mb-8">A verification link has been sent to your email. Please verify before logging in.</p>
          <Button 
            onClick={() => setLocation('/login')}
            className="w-full bg-[#C9A84C] hover:bg-[#B0923D] text-black font-bold h-12 rounded-none transition-all duration-300 uppercase tracking-widest text-xs"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-none p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#F5F0EB] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Create Account</h1>
          <p className="text-[#A0A0A0] text-sm">Join StyleAI for a personalized luxury fashion experience</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-semibold">Full Name</label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-transparent border-[#333] text-[#F5F0EB] focus:border-[#C9A84C] rounded-none h-11"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-semibold">Email Address</label>
            <Input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-transparent border-[#333] text-[#F5F0EB] focus:border-[#C9A84C] rounded-none h-11"
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-semibold">Password</label>
            <Input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="bg-transparent border-[#333] text-[#F5F0EB] focus:border-[#C9A84C] rounded-none h-11"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-semibold">Confirm Password</label>
            <Input 
              type="password" 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="bg-transparent border-[#333] text-[#F5F0EB] focus:border-[#C9A84C] rounded-none h-11"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#C9A84C] hover:bg-[#B0923D] text-black font-bold h-12 rounded-none mt-4 transition-all duration-300 uppercase tracking-widest text-xs"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#2A2A2A] text-center">
          <p className="text-[#A0A0A0] text-sm">
            Already have an account? <Link href="/login" className="text-[#C9A84C] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
