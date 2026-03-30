import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  colorScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadThemeMode: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'system',
  colorScheme: (Appearance.getColorScheme() as 'light' | 'dark') || 'light',
  
  setThemeMode: async (mode: ThemeMode) => {
    try {
      await SecureStore.setItemAsync('themeMode', mode);
      const systemScheme = Appearance.getColorScheme() as 'light' | 'dark' || 'light';
      set({ 
        themeMode: mode,
        colorScheme: mode === 'system' ? systemScheme : mode
      });
    } catch (e) {
      console.error('Error saving theme mode:', e);
    }
  },
  
  loadThemeMode: async () => {
    try {
      const stored = await SecureStore.getItemAsync('themeMode');
      const mode = (stored as ThemeMode) || 'system';
      const systemScheme = Appearance.getColorScheme() as 'light' | 'dark' || 'light';
      set({ 
        themeMode: mode,
        colorScheme: mode === 'system' ? systemScheme : mode
      });
    } catch (e) {
      console.error('Error loading theme mode:', e);
    }
  }
}));

// Listener for system changes
Appearance.addChangeListener(({ colorScheme }) => {
  const store = useThemeStore.getState();
  if (store.themeMode === 'system') {
    useThemeStore.setState({ colorScheme: (colorScheme as 'light' | 'dark') || 'light' });
  }
});
