import { useThemeStore } from '../store/theme';

export const useColorScheme = () => {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  return colorScheme || 'light';
};
