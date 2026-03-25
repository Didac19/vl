import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes, useCreateTransportType, useUpdateTransportType } from '../../lib/queries';
import { TransportType, CreateTransportTypeDto } from '@via-libre/shared-types';
import { theme } from '../../constants/theme';

const TRANSPORT_TYPES: { label: string, value: TransportType }[] = [
  { label: 'Cable Aéreo', value: 'CABLE_AEREO' },
  { label: 'Bus Urbano', value: 'BUS_URBANO' },
  { label: 'Buseta', value: 'BUSETA' },
  { label: 'Intermunicipal', value: 'INTERMUNICIPAL' },
  { label: 'Cooperativa', value: 'COOPERATIVA' },
  { label: 'Microbús', value: 'MICROBUS' },
];

export default function AdminEditTransportTypeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const { data: transportTypes, isLoading: isLoadingTypes } = useTransportRoutes();
  const loading = isEditing ? isLoadingTypes : false;

  const createTransportType = useCreateTransportType();
  const updateTransportType = useUpdateTransportType();

  const [form, setForm] = useState<CreateTransportTypeDto>({
    name: '',
    type: 'BUS_URBANO',
    fareAmount: 0,
    requiresRouteSelection: true,
  });

  const type = transportTypes?.find((t: any) => t.id === id);

  useEffect(() => {
    if (isEditing && type) {
      setForm({
        name: type.name,
        type: type.type,
        fareAmount: type.fareAmount,
        requiresRouteSelection: type.requiresRouteSelection,
      });
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (!form.name || form.fareAmount < 0) {
      Alert.alert("Validación", "Por favor completa todos los campos correctamente.");
      return;
    }

    try {
      if (isEditing) {
        await updateTransportType.mutateAsync({ id: id as string, data: form });
      } else {
        await createTransportType.mutateAsync(form);
      }
      router.back();
    } catch (error) {
      console.error('Error saving transport type:', error);
      Alert.alert("Error", "No se pudo guardar el tipo de transporte.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary.esmeralda} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Editar Tipo' : 'Nuevo Tipo'}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={createTransportType.isPending || updateTransportType.isPending}>
          {(createTransportType.isPending || updateTransportType.isPending) ? <ActivityIndicator size="small" color="white" /> : <Save size={24} color="white" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="Ej: Cable Aéreo"
          />

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.typeSelector}>
            {TRANSPORT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeOption, form.type === t.value && styles.typeOptionActive]}
                onPress={() => setForm({ ...form, type: t.value })}
              >
                <Text style={[styles.typeLabel, form.type === t.value && styles.typeLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Tarifa Base (COP)</Text>
          <TextInput
            style={styles.input}
            value={form.fareAmount.toString()}
            onChangeText={(text) => setForm({ ...form, fareAmount: parseInt(text) || 0 })}
            keyboardType="numeric"
            placeholder="2500"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>Requiere selección de ruta</Text>
              <Text style={styles.helperText}>
                Si está apagado, la app saltará directamente al pago al elegir este tipo.
              </Text>
            </View>
            <Switch
              value={form.requiresRouteSelection}
              onValueChange={(val) => setForm({ ...form, requiresRouteSelection: val })}
              trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary.esmeraldaPale }}
              thumbColor={form.requiresRouteSelection ? theme.colors.primary.esmeralda : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    ...theme.shadows.sm,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.neutral[900],
  },
  saveButton: {
    backgroundColor: theme.colors.primary.esmeralda,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[50],
  },
  scroll: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: theme.colors.neutral[900],
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[100],
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary.esmeralda,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.neutral[600],
  },
  typeLabelActive: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginTop: -4,
  },
});