import { create } from 'zustand';
import { apiRequest } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  _count?: {
    orders?: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: User, newToken?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('prismart_user') || 'null'),
  token: localStorage.getItem('prismart_token'),
  isAuthenticated: !!localStorage.getItem('prismart_token'),
  isAdmin: JSON.parse(localStorage.getItem('prismart_user') || 'null')?.role === 'ADMIN',
  loading: true,

  setAuth: (token: string, user: User) => {
    localStorage.setItem('prismart_token', token);
    localStorage.setItem('prismart_user', JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      loading: false,
    });
  },

  updateUser: (user: User, newToken?: string) => {
    const currentToken = newToken || get().token || localStorage.getItem('prismart_token') || '';
    if (currentToken) {
      localStorage.setItem('prismart_token', currentToken);
    }
    localStorage.setItem('prismart_user', JSON.stringify(user));
    set({
      token: currentToken,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
    });
  },

  logout: () => {
    localStorage.removeItem('prismart_token');
    localStorage.removeItem('prismart_user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('prismart_token');
    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const response = await apiRequest<User>('/auth/me');
      if (response.success && response.data) {
        get().setAuth(token, response.data);
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    } finally {
      set({ loading: false });
    }
  },
}));
