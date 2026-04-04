// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
  logout,
  getCurrentUser,
} from '@/lib/auth';

interface User {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  roomId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: string) => Promise<string>;
  signIn: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getCurrentUser(setUser, setLoading);
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signUp: signUpWithEmail,
    signIn: signInWithEmail,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
