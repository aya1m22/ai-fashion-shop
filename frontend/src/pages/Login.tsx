import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password);
      setLocation('/women');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-none p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#F5F0EB] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Welcome Back</h1>
          <p className="text-[#A0A0A0] text-sm">Enter your credentials to access your StyleAI account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#C9A84C] font-semibold">Email Address</label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-[#333] text-[#F5F0EB] focus:border-[#C9A84C] rounded-none h-12"
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#C9A84C] font-semibold">Password</label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-[#333] text-[#F5F0EB] focus:border-[#C9A84C] rounded-none h-12"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#C9A84C] hover:bg-[#B0923D] text-black font-bold h-12 rounded-none transition-all duration-300 uppercase tracking-widest text-xs"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#2A2A2A] text-center">
          <p className="text-[#A0A0A0] text-sm">
            New to StyleAI? <Link href="/signup" className="text-[#C9A84C] hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
