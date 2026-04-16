import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../constants/theme';
import { useAuthStore } from '../store/auth';
import { useColorScheme } from '../components/useColorScheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '../store/theme';
import { UserRole } from '@transix/shared-types';

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    checkAuth();
    useThemeStore.getState().loadThemeMode();
  }, [checkAuth]);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();

      if (!user) {
        router.replace('/(auth)/login');
      } else if (user.role === UserRole.VALIDATOR) {
        router.replace('/validator/scan');
      }
    }
  }, [loaded, isLoading, user]);

  const colorScheme = useColorScheme();

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false, animation: 'fade' }} />
              <Stack.Screen name="(auth)/register" options={{ title: 'Registro', headerBackTitle: 'Login' }} />
              <Stack.Screen name="select-transport" options={{ headerShown: false }} />
              <Stack.Screen name="purchase-ticket" options={{ headerShown: false }} />
              <Stack.Screen name="ticket-detail" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
              <Stack.Screen name="change-password" options={{ headerShown: false }} />
              <Stack.Screen name="admin/transport-types" options={{ headerShown: false }} />
              <Stack.Screen name="admin/routes" options={{ headerShown: false }} />
              <Stack.Screen name="admin/edit-route" options={{ headerShown: false }} />
              <Stack.Screen name="admin/edit-transport-type" options={{ headerShown: false }} />
              <Stack.Screen name="validator/scan" options={{ headerShown: false }} />
              <Stack.Screen name="top-up" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

