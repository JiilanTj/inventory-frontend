export type UserRole = 'admin' | 'user';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
} 