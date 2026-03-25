import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Edit2, Trash2, MapPin, DollarSign } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes, useDeleteRoute } from '../../lib/queries';
import { useAuthStore } from '../../store/auth';
import { TransportTypeDto, RouteDto, UserRole } from '@via-libre/shared-types';
import { theme } from '../../constants/theme';

export default function AdminRoutesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { typeId, typeName } = useLocalSearchParams();
  const params = user?.role === UserRole.COMPANY_ADMIN ? { companyId: user.companyId } : {};
  const { data: transportTypes, isLoading: loading } = useTransportRoutes(params);
  const deleteRoute = useDeleteRoute();

  const routes = transportTypes?.find((t: TransportTypeDto) => t.id === typeId)?.routes || [];

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Eliminar Ruta",
      `¿Estás seguro de que quieres eliminar "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoute.mutateAsync(id);
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la ruta.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Rutas</Text>
          <Text style={styles.subtitle}>{typeName}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push({ pathname: '/admin/edit-route', params: { typeId } })}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary.esmeralda} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/admin/edit-route', params: { id: route.id, typeId } })}
            >
              <View style={styles.cardContent}>
                <View style={styles.routeHeader}>
                  <Text style={styles.cardTitle}>{route.name}</Text>
                  <View style={[styles.badge, { backgroundColor: route.pricingStrategy === 'FLAT' ? theme.colors.primary.esmeraldaPale : theme.colors.primary.esmeraldaMid }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.primary.esmeraldaDeep }]}>
                      {route.pricingStrategy === 'FLAT' ? 'TARIFA FIJA' : 'PUNTO A PUNTO'}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeStats}>
                  <View style={styles.statItem}>
                    <MapPin size={16} color={theme.colors.neutral[500]} />
                    <Text style={styles.statText}>{route.stops.length} Paradas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <DollarSign size={16} color={theme.colors.neutral[500]} />
                    <Text style={styles.statText}>${route.baseFare.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/admin/edit-route', params: { id: route.id, typeId } })}
                  style={styles.actionBtn}
                >
                  <Edit2 size={20} color={theme.colors.neutral[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(route.id, route.name)}
                  style={styles.actionBtn}
                >
                  <Trash2 size={20} color={theme.colors.semantic.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {routes.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No hay rutas configuradas para este tipo.</Text>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.neutral[900],
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    textTransform: 'uppercase',
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
  cardContent: {
    flex: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  routeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
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