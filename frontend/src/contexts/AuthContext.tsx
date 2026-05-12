import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  emailVerified: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  verifyEmail: (email?: string) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "aya12m34@gmail.com";
const ADMIN_PASS = "aya18btta28baraa08";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('styleai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signup = async (userData: any) => {
    const users = JSON.parse(localStorage.getItem('styleai_users') || '[]');
    if (users.find((u: any) => u.email === userData.email)) {
      throw new Error('Email already exists');
    }
    
    const newUser = {
      ...userData,
      emailVerified: false,
      isAdmin: userData.email === ADMIN_EMAIL
    };
    
    users.push(newUser);
    localStorage.setItem('styleai_users', JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('styleai_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const adminUser = {
        email: ADMIN_EMAIL,
        name: 'Admin',
        emailVerified: true,
        isAdmin: true
      };
      setUser(adminUser);
      localStorage.setItem('styleai_user', JSON.stringify(adminUser));
      return;
    }

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    if (!foundUser.emailVerified) {
      throw new Error('Please verify your email first.');
    }

    const sessionUser = {
      email: foundUser.email,
      name: foundUser.name,
      emailVerified: foundUser.emailVerified,
      isAdmin: foundUser.email === ADMIN_EMAIL
    };

    setUser(sessionUser);
    localStorage.setItem('styleai_user', JSON.stringify(sessionUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('styleai_user');
  };

  const verifyEmail = (emailToVerify?: string) => {
    const users = JSON.parse(localStorage.getItem('styleai_users') || '[]');
    const targetEmail = emailToVerify || user?.email;
    
    if (targetEmail) {
      const userIndex = users.findIndex((u: any) => u.email === targetEmail);
      if (userIndex > -1) {
        users[userIndex].emailVerified = true;
        localStorage.setItem('styleai_users', JSON.stringify(users));
        
        // Auto-login
        const verifiedUser = users[userIndex];
        const sessionUser = {
          email: verifiedUser.email,
          name: verifiedUser.name,
          emailVerified: true,
          isAdmin: verifiedUser.email === ADMIN_EMAIL
        };
        setUser(sessionUser);
        localStorage.setItem('styleai_user', JSON.stringify(sessionUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, verifyEmail, isAdmin: !!user?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
