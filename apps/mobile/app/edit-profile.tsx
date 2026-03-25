import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Phone, Save, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth';
import { useUpdateProfile, useDeleteAccount } from '../lib/queries';

const colors = {
  background: "#fcf9f5",
  primary: "#006a37",
  onPrimary: "#ffffff",
  secondary: "#9e4127",
  onSurface: "#1c1c1a",
  onSurfaceVariant: "#3e4a3f",
  surfaceContainerLowest: "#ffffff",
  outline: "#6e7a6e",
  error: "#ba1a1a",
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, fetchProfile, logout } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

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
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color={colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.outline + '80'}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputWrapper}>
              <Phone size={20} color={colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Tu número de teléfono"
                placeholderTextColor={colors.outline + '80'}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico (No editable)</Text>
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
          <Text style={styles.dangerTitle}>Zona de Peligro</Text>
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

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  scrollContent: {
    padding: 24,
  },
  form: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: colors.onSurface,
  },
  disabledInput: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    opacity: 0.7,
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
    marginTop: 8,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.error + '20',
    backgroundColor: colors.error + '05',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 12,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
