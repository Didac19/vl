import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Phone, Save, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth';
import { useUpdateProfile, useDeleteAccount } from '../lib/queries';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { theme } from '@/constants/theme';

// Removed hardcoded colors object

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, fetchProfile, logout } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, isDark);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido');
      return;
    }

    try {
      await updateProfile.mutateAsync({ fullName, phone });
      await fetchProfile();
      Alert.alert('Éxito', 'Perfil actualizado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás completamente seguro? Esta acción es irreversible y perderás todos tus datos y saldo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar definitivamente', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount.mutateAsync();
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudo eliminar la cuenta');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.avatarText, { color: colors.onPrimaryContainer }]}>{getInitials(fullName)}</Text>
            </View>
            <TouchableOpacity style={styles.avatarEditBadge}>
              <User size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Toque para cambiar foto</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.formTitle}>Información Básica</Text>
          
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.outline}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputWrapper}>
              <Phone size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Tu número de teléfono"
                placeholderTextColor={colors.outline}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <TextInput
                style={[styles.input, { color: colors.outline }]}
                value={user?.email}
                editable={false}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, updateProfile.isPending && styles.disabledButton]} 
            onPress={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Eliminar Cuenta</Text>
          <Text style={styles.dangerDesc}>Esta acción es permanente y eliminará todos sus datos y saldo disponible.</Text>
          <TouchableOpacity 
            style={[styles.deleteButton, deleteAccount.isPending && styles.disabledButton]} 
            onPress={handleDeleteAccount}
            disabled={deleteAccount.isPending}
          >
            {deleteAccount.isPending ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <>
                <Trash2 size={20} color={colors.error} />
                <Text style={styles.deleteButtonText}>Eliminar mi cuenta</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  scrollContent: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      }
    }),
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: colors.text,
  },
  disabledInput: {
    backgroundColor: colors.surfaceVariant,
    opacity: 0.6,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 12,
    gap: 12,
    ...theme.shadows[isDark ? 'dark' : 'light'].md,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  dangerZone: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.error + '30',
    backgroundColor: colors.error + '10',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.error,
    marginBottom: 8,
  },
  dangerDesc: {
    fontSize: 14,
    color: colors.error,
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.error,
    gap: 12,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
});
