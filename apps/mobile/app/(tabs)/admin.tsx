import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LayoutGrid, QrCode, ChevronRight, BarChart2 } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useAuthStore } from '../../store/auth';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { UserRole } from '@transix/shared-types';

export default function AdminScreen() {
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Administración</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Panel Principal</Text>
        <View style={[styles.menu, { backgroundColor: colors.surface }]}>
          <MenuRow
            icon={<LayoutGrid size={20} color={colors.primary} />}
            label={isAdmin ? "Gestionar Transporte (Global)" : "Gestionar Mis Rutas"}
            onPress={() => router.push('/admin/transport-types')}
            colors={colors}
          />
          <MenuRow
            icon={<QrCode size={20} color={colors.primary} />}
            label="Generar QR para Buses"
            onPress={() => router.push('/admin/generate-qr')}
            colors={colors}
          />
          <MenuRow
            icon={<BarChart2 size={20} color={colors.primary} />}
            label="Consultar Recaudos por Bus"
            onPress={() => router.push('/admin/select-qr-recaudos')}
            colors={colors}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label, onPress, colors }: { icon: any, label: string, onPress?: () => void, colors: any }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>{icon}</View>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <ChevronRight size={20} color={colors.outline} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: theme.spacing[4],
  },
  header: {
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
    marginTop: 8,
  },
  menu: {
    borderRadius: 16,
    paddingHorizontal: 4,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      }
    })
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
