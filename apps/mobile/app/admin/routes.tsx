import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Edit2, Trash2, MapPin, DollarSign } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes, useDeleteRoute } from '../../lib/queries';
import { useAuthStore } from '../../store/auth';
import { TransportTypeDto, RouteDto, UserRole } from '@transix/shared-types';
import { theme } from '../../constants/theme';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';

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

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const shadows = theme.shadows[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.surface }, shadows.sm]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Rutas</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{typeName}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push({ pathname: '/admin/edit-route', params: { typeId } })}
        >
          <Plus size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[styles.card, { backgroundColor: colors.surface }, shadows.sm]}
              onPress={() => router.push({ pathname: '/admin/edit-route', params: { id: route.id, typeId } })}
            >
              <View style={styles.cardContent}>
                <View style={styles.routeHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{route.name}</Text>
                  <View style={[styles.badge, { backgroundColor: route.pricingStrategy === 'FLAT' ? theme.colors.primary.esmeraldaPale : theme.colors.primary.esmeraldaMid }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.primary.esmeraldaDeep }]}>
                      {route.pricingStrategy === 'FLAT' ? 'TARIFA FIJA' : 'PUNTO A PUNTO'}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeStats}>
                  <View style={styles.statItem}>
                    <MapPin size={16} color={colors.onSurfaceVariant} />
                    <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>{route.stops.length} Paradas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <DollarSign size={16} color={colors.onSurfaceVariant} />
                    <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>${route.baseFare.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/admin/edit-route', params: { id: route.id, typeId } })}
                  style={styles.actionBtn}
                >
                  <Edit2 size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(route.id, route.name)}
                  style={styles.actionBtn}
                >
                  <Trash2 size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {routes.length === 0 && (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No hay rutas configuradas para este tipo.</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    height: 72,
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
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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