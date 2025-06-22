'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/models/user';
import { getCurrentUser } from '@/services/auth';
import { ROUTES, AUTH_KEY } from '@/config/constants';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // Alternative: localStorage.removeItem(AUTH_KEY);

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear all cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }

    // Reset auth context
    setUser(null);
    
    // Redirect to login
    router.push(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout: handleLogout,
      }}
    >
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