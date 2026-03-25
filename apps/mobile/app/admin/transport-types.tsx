import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Edit2, Trash2, Bus, Train, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes, useDeleteTransportType } from '../../lib/queries';
import { useAuthStore } from '../../store/auth';
import { TransportTypeDto, TransportType, UserRole } from '@via-libre/shared-types';
import { theme } from '../../constants/theme';

export default function AdminTransportTypesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;
  const params = user?.role === UserRole.COMPANY_ADMIN ? { companyId: user.companyId } : {};
  const { data: rawTypes, isLoading: loading } = useTransportRoutes(params);
  const deleteType = useDeleteTransportType();

  let types = rawTypes || [];
  // If Company Admin, only show categories that have at least one route for them
  if (user?.role === UserRole.COMPANY_ADMIN) {
    types = types.filter((t: TransportTypeDto) => t.routes.length > 0);
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Eliminar Tipo",
      `¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer y eliminará todas las rutas asociadas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteType.mutateAsync(id);
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el tipo de transporte.");
            }
          }
        }
      ]
    );
  };

  const getIcon = (type: TransportType) => {
    switch (type) {
      case 'CABLE_AEREO': return <Train size={24} color={theme.colors.primary.esmeralda} />;
      case 'BUS_URBANO': return <Bus size={24} color={theme.colors.primary.esmeralda} />;
      case 'BUSETA': return <Navigation size={24} color={theme.colors.primary.esmeralda} />;
      default: return <Bus size={24} color={theme.colors.primary.esmeralda} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>{isAdmin ? "Gestionar Transporte" : "Mis Categorías"}</Text>
        {isAdmin ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/admin/edit-transport-type')}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary.esmeralda} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {types.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/admin/routes', params: { typeId: item.id, typeName: item.name } })}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>{getIcon(item.type)}</View>
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {item.routes.length} {item.routes.length === 1 ? 'Ruta configurada' : 'Rutas configuradas'}
                  </Text>
                </View>
              </View>
              {isAdmin && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/admin/edit-transport-type', params: { id: item.id } })}
                    style={styles.actionBtn}
                  >
                    <Edit2 size={20} color={theme.colors.neutral[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    style={styles.actionBtn}
                  >
                    <Trash2 size={20} color={theme.colors.semantic.error} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {types.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No hay tipos de transporte configurados.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  addButton: {
    backgroundColor: theme.colors.primary.esmeralda,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary.esmeraldaPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.neutral[500],
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  empty: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.neutral[500],
    fontSize: 16,
  },
});