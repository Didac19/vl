import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Ticket, User } from 'lucide-react-native';
import { theme } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.esmeralda,
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[100],
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
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
    </Tabs>
  );
}
