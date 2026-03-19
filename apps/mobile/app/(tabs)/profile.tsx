import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, Settings, HelpCircle, Map } from 'lucide-react-native';
import { theme } from '../../constants/theme';

export default function ProfileScreen() {
  const [isPushEnabled, setIsPushEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>

        {/* Info de Usuario */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JC</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Juan Carlos</Text>
            <Text style={styles.userEmail}>j.carlos@email.com</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Viajero Esmeralda</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Settings size={20} color={theme.colors.neutral[500]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Cuenta y Seguridad</Text>
        <View style={styles.menu}>
          <MenuRow icon={<User size={20} color={theme.colors.neutral[600]} />} label="Información Personal" />
          <MenuRow icon={<CreditCard size={20} color={theme.colors.neutral[600]} />} label="Métodos de Pago" />
          <MenuRow icon={<Shield size={20} color={theme.colors.neutral[600]} />} label="Cambiar Contraseña" />
        </View>

        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.menu}>
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}><Bell size={20} color={theme.colors.neutral[600]} /></View>
              <Text style={styles.menuLabel}>Notificaciones Push</Text>
            </View>
            <Switch
              value={isPushEnabled}
              onValueChange={setIsPushEnabled}
              trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary.esmeraldaPale }}
              thumbColor={isPushEnabled ? theme.colors.primary.esmeralda : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.menu}>
          <MenuRow icon={<Map size={20} color={theme.colors.neutral[600]} />} label="Idioma (Español CO)" />
          <MenuRow icon={<HelpCircle size={20} color={theme.colors.neutral[600]} />} label="Ayuda y Soporte" />
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={20} color={theme.colors.semantic.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Vía Libre v1.0.0 (Beta)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label }: { icon: any, label: string }) {
  return (
    <TouchableOpacity style={styles.menuRow}>
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <ChevronRight size={20} color={theme.colors.neutral[300]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
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
    color: theme.colors.neutral[900],
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.md,
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
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.neutral[500],
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
    color: theme.colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 4,
    marginBottom: 24,
    ...theme.shadows.sm,
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
    backgroundColor: theme.colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[800],
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
