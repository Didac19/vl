import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Ticket, User, Map as MapIcon, Briefcase } from 'lucide-react-native';
import { theme } from '../../constants/theme';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@transix/shared-types';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.role === UserRole.ADMIN;
  const isCompanyAdmin = user?.role === UserRole.COMPANY_ADMIN;
  const hasAdminAccess = isAdmin || isCompanyAdmin;

  useEffect(() => {
    if (user?.role === UserRole.VALIDATOR) {
      router.replace('/validator/scan');
    }
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.outlineVariant,
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.sans,
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="near-places"
        options={{
          title: 'Cerca de mí',
          tabBarIcon: ({ color, size }) => <MapIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Mis Pasajes',
          tabBarIcon: ({ color, size }) => <Ticket color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
          href: hasAdminAccess ? '/admin' : null,
        }}
      />
    </Tabs>
  );
}
