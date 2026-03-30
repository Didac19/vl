import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, Settings, HelpCircle, Map, LayoutGrid, Sun, Moon, Laptop } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useAuthStore } from '../../store/auth';
import { useThemeStore, ThemeMode } from '../../store/theme';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  const [isPushEnabled, setIsPushEnabled] = React.useState(true);
  const { user, logout } = useAuthStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const isAdmin = user?.role === 'ADMIN';
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';
  const hasAdminAccess = isAdmin || isCompanyAdmin;

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Mi Perfil</Text>
        </View>

        {/* Info de Usuario */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.fullName || 'Usuario')}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Usuario'}</Text>
            <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>{user?.email || 'email@ejemplo.com'}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{user?.role === 'ADMIN' ? 'Super Administrador' : user?.role === 'COMPANY_ADMIN' ? 'Admin de Compañía' : 'Viajero Esmeralda'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
            <Settings size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {hasAdminAccess && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Panel de Administración</Text>
            <View style={[styles.menu, { backgroundColor: colors.surface }]}>
              <MenuRow
                icon={<LayoutGrid size={20} color={colors.primary} />}
                label={isAdmin ? "Gestionar Transporte (Global)" : "Gestionar Mis Rutas"}
                onPress={() => router.push('/admin/transport-types')}
                colors={colors}
              />
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Cuenta y Seguridad</Text>
        <View style={[styles.menu, { backgroundColor: colors.surface }]}>
          <MenuRow
            icon={<User size={20} color={colors.onSurfaceVariant} />}
            label="Información Personal"
            onPress={() => router.push('/edit-profile')}
            colors={colors}
          />
          <MenuRow
            icon={<CreditCard size={20} color={colors.onSurfaceVariant} />}
            label="Métodos de Pago"
            colors={colors}
          />
          <MenuRow
            icon={<Shield size={20} color={colors.onSurfaceVariant} />}
            label="Cambiar Contraseña"
            onPress={() => router.push('/change-password')}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Notificaciones</Text>
        <View style={[styles.menu, { backgroundColor: colors.surface }]}>
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: colorScheme === 'dark' ? theme.colors.neutral[800] : theme.colors.neutral[50] }]}><Bell size={20} color={colors.onSurfaceVariant} /></View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Notificaciones Push</Text>
            </View>
            <Switch
              value={isPushEnabled}
              onValueChange={setIsPushEnabled}
              trackColor={{ false: colors.outline, true: colors.primaryContainer }}
              thumbColor={isPushEnabled ? colors.primary : colors.surfaceVariant}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Apariencia</Text>
        <View style={[styles.menu, { backgroundColor: colors.surface, padding: 12 }]}>
          <View style={styles.themeSelector}>
            <ThemeOption 
              mode="light" 
              active={themeMode === 'light'} 
              onPress={() => setThemeMode('light')} 
              icon={<Sun size={20} color={themeMode === 'light' ? colors.onPrimary : colors.onSurfaceVariant} />}
              label="Claro"
              colors={colors}
            />
            <ThemeOption 
              mode="dark" 
              active={themeMode === 'dark'} 
              onPress={() => setThemeMode('dark')} 
              icon={<Moon size={20} color={themeMode === 'dark' ? colors.onPrimary : colors.onSurfaceVariant} />}
              label="Oscuro"
              colors={colors}
            />
            <ThemeOption 
              mode="system" 
              active={themeMode === 'system'} 
              onPress={() => setThemeMode('system')} 
              icon={<Laptop size={20} color={themeMode === 'system' ? colors.onPrimary : colors.onSurfaceVariant} />}
              label="Sistema"
              colors={colors}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Preferencias</Text>
        <View style={[styles.menu, { backgroundColor: colors.surface }]}>
          <MenuRow icon={<Map size={20} color={colors.onSurfaceVariant} />} label="Idioma (Español CO)" colors={colors} />
          <MenuRow icon={<HelpCircle size={20} color={colors.onSurfaceVariant} />} label="Ayuda y Soporte" colors={colors} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={theme.colors.semantic.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>TranSix v1.0.0 (Beta)</Text>
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

function ThemeOption({ mode, active, onPress, icon, label, colors }: { mode: ThemeMode, active: boolean, onPress: () => void, icon: any, label: string, colors: any }) {
  return (
    <TouchableOpacity 
      style={[
        styles.themeOption, 
        active && { backgroundColor: colors.primary }
      ]} 
      onPress={onPress}
    >
      {icon}
      <Text style={[
        styles.themeOptionLabel, 
        { color: active ? colors.onPrimary : colors.onSurfaceVariant }
      ]}>
        {label}
      </Text>
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
  profileCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      }
    })
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.esmeraldaMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary.esmeraldaDeep,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary.esmeraldaPale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary.esmeralda,
    textTransform: 'uppercase',
  },
  editBtn: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
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
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  themeOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.semantic.error,
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.neutral[400],
    fontSize: 12,
  },
});
