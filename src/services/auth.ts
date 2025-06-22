import { API_BASE_URL, AUTH_KEY } from '@/config/constants';
import { LoginResponse, User } from '@/models/user';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
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

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
}; 