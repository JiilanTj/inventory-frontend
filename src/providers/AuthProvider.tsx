'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/models/user';
import { getCurrentUser, getToken } from '@/services/auth';
import { ROUTES, AUTH_KEY, TOKEN_KEY } from '@/config/constants';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth state...');
      const currentUser = getCurrentUser();
      const token = getToken();
      console.log('Current auth state:', { currentUser, token, pathname });

      // Set user state
      setUser(currentUser);

      const isLoginPage = pathname === ROUTES.LOGIN;
      const isAuthenticated = currentUser && token;

      // If on login page and authenticated, redirect to appropriate dashboard
      if (isAuthenticated && isLoginPage) {
        console.log('Already authenticated on login page, redirecting...');
        const targetRoute = currentUser.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD;
        router.replace(targetRoute);
        return;
      }

      // If not on login page and not authenticated, redirect to login
      if (!isAuthenticated && !isLoginPage) {
        console.log('Not authenticated on protected route, redirecting to login...');
        router.replace(ROUTES.LOGIN);
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.replace(ROUTES.LOGIN);
  };

  // Show loading state only when we're in a transition
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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