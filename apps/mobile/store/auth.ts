import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserDto } from '@via-libre/shared-types';

interface AuthState {
  user: UserDto | null;
  isLoading: boolean;
  setAuth: (user: UserDto, accessToken: string, refreshToken: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    set({ user, isLoading: false });
  },
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser), isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, isLoading: false });
  },
}));
