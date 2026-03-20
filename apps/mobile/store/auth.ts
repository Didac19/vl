import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserDto } from '@via-libre/shared-types';
import { api } from '@/lib/api';

interface AuthState {
  user: UserDto | null;
  isLoading: boolean;
  setAuth: (user: UserDto, accessToken: string, refreshToken: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setAuth: async (user, accessToken, refreshToken) => {
    try {
      if (accessToken) await SecureStore.setItemAsync('accessToken', accessToken);
      if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
      if (user) {
        await SecureStore.setItemAsync('user', JSON.stringify(user));
      }
      set({ user: user || null, isLoading: false });
    } catch (e) {
      console.error('Error saving auth to SecureStore:', e);
      // Fallback: update state even if storage fails
      set({ user: user || null, isLoading: false });
    }
  },
  fetchProfile: async () => {
    try {
      const response = await api.get('/users/me');
      const user = response.data;
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If unauthorized, logout
      if ((error as any).response?.status === 401) {
        await get().logout();
      }
    }
  },
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      // Try to get user from storage first for quick UI update
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser) });
      }

      // Refresh profile in background to ensure data is up to date
      await get().fetchProfile();
    } catch (e) {
      console.error('Error in checkAuth:', e);
      set({ user: null, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
    } catch (e) {
      console.error('Error clearing SecureStore during logout:', e);
    } finally {
      set({ user: null, isLoading: false });
    }
  },
}));
