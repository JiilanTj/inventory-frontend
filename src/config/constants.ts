export const API_BASE_URL = 'http://localhost:5000/api';

export const AUTH_KEY = 'auth';
export const TOKEN_KEY = 'token';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ITEMS: '/admin/items',
  ADMIN_BORROWS: '/admin/borrows',
  ADMIN_USERS: '/admin/users',
  ADMIN_PROFILE: '/admin/profile',
  USER_DASHBOARD: '/dashboard',
} as const; 