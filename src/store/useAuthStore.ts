import { create } from 'zustand';
import { apiRequest } from '@/services/api';
import { identifyUser, trackEcommerceEvent } from '@/lib/analytics';

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

const getItem = (key: string) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('prismart_user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('prismart_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('prismart_token') : false,
  isAdmin: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('prismart_user') || 'null')?.role === 'ADMIN' : false,
  loading: true,

  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prismart_token', token);
      localStorage.setItem('prismart_user', JSON.stringify(user));
    }
    set({
      token,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      loading: false,
    });

    identifyUser(user);
    trackEcommerceEvent('login', { method: 'JWT' });
  },

  updateUser: (user: User, newToken?: string) => {
    const currentToken = newToken || get().token || getItem('prismart_token') || '';
    if (typeof window !== 'undefined' && currentToken) {
      localStorage.setItem('prismart_token', currentToken);
      localStorage.setItem('prismart_user', JSON.stringify(user));
    }
    set({
      token: currentToken,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
    });

    identifyUser(user);
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prismart_token');
      localStorage.removeItem('prismart_user');
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    trackEcommerceEvent('logout');
  },

  checkAuth: async () => {
    const token = getItem('prismart_token');
    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const response = await apiRequest<{ user: User }>('/auth/me');
      if (response.success && response.data?.user) {
        get().setAuth(token, response.data.user);
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
