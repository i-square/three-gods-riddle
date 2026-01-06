import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  isAdmin: boolean;
  
  setAuth: (token: string, mustChangePassword: boolean, isAdmin: boolean) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setMustChangePassword: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      mustChangePassword: false,
      isAdmin: false,

      setAuth: (token, mustChangePassword, isAdmin) => {
        localStorage.setItem('token', token);
        set({
          token,
          isAuthenticated: true,
          mustChangePassword,
          isAdmin,
        });
      },

      setUser: (user) => {
        set({
          user,
          mustChangePassword: user.must_change_password,
          isAdmin: user.is_admin,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          mustChangePassword: false,
          isAdmin: false,
        });
      },

      setMustChangePassword: (value) => {
        set({ mustChangePassword: value });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
