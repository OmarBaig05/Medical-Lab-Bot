import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Doctor';
  walletBalance: number;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'Patient' | 'Doctor') => void;
  signup: (name: string, email: string, password: string, role: 'Patient' | 'Doctor') => void;
  logout: () => void;
  updateWalletBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Doctor',
    walletBalance: 15.50,
    verified: true
  });

  const login = (email: string, password: string, role: 'Patient' | 'Doctor') => {
    setUser({
      id: '1',
      name: role === 'Doctor' ? 'Dr. Sarah Johnson' : 'John Smith',
      email,
      role,
      walletBalance: 15.50,
      verified: role === 'Doctor'
    });
  };

  const signup = (name: string, email: string, password: string, role: 'Patient' | 'Doctor') => {
    setUser({
      id: '1',
      name,
      email,
      role,
      walletBalance: 5.00,
      verified: false
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateWalletBalance = (amount: number) => {
    if (user) {
      setUser({ ...user, walletBalance: user.walletBalance + amount });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateWalletBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}