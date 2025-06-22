'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/config/constants';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);

      if (response.status === 'success') {
        localStorage.setItem('auth', JSON.stringify(response));
        document.cookie = `auth=${JSON.stringify(response)}; path=/`;
        setUser(response.data.user);
        
        if (response.data.user.role === 'admin') {
          router.push(ROUTES.ADMIN_DASHBOARD);
        } else {
          router.push(ROUTES.USER_DASHBOARD);
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white p-3 rounded-full shadow-lg">
            <Image
              src="/logosmk.png"
              alt="SMKN 4 Padalarang Logo"
              width={80}
              height={0}
              className="w-20 h-auto"
              priority
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Sistem Inventaris
        </h1>
        <h2 className="text-xl text-blue-100">
          Jurusan RPL SMKN 4 Padalarang
        </h2>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Login to System
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out text-gray-900 placeholder-gray-400"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm py-2 px-4 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg py-3 px-4 font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            © 2024 Jurusan RPL SMKN 4 Padalarang. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
} 