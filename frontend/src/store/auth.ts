import { create } from 'zustand';
import { User } from '@/types';
import { setAccessToken } from '@/lib/axios';
import { authApi } from '@/lib/api';

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   setUser: (user: User | null) => void;
//   login: (user: User, token: string) => void;
//   logout: () => Promise<void>;
//   initialize: () => Promise<void>;
// }

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user: User, token: string) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));