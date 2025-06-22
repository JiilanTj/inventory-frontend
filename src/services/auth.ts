import { API_BASE_URL, AUTH_KEY, TOKEN_KEY } from '@/config/constants';
import { LoginResponse, User } from '@/models/user';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  console.log('Login API response:', data);
  
  if (data.status === 'success' && data.token) {
    // Store token separately
    localStorage.setItem(TOKEN_KEY, data.token);
    
    // Store user data without token
    const authData = {
      status: data.status,
      data: {
        user: data.data.user
      }
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    // Set cookie for middleware
    document.cookie = `${AUTH_KEY}=${encodeURIComponent(JSON.stringify(authData))}; path=/;`;
  } else {
    throw new Error('Invalid response format');
  }
  
  return data;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
  // Remove cookie for middleware
  document.cookie = `${AUTH_KEY}=; Max-Age=0; path=/;`;
};

export const getCurrentUser = (): User | null => {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return null;

  try {
    const userData = JSON.parse(auth);
    return userData.data.user;
  } catch {
    return null;
  }
};

export const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser() && !!getToken();
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
}; 