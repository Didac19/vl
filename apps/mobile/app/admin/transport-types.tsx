import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Edit2, Trash2, Bus, Train, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes, useDeleteTransportType } from '../../lib/queries';
import { useAuthStore } from '../../store/auth';
import { TransportTypeDto, TransportType, UserRole } from '@transix/shared-types';
import { theme as uiTheme } from '../../constants/theme';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';


export default function AdminTransportTypesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const uiShadows = uiTheme.shadows[colorScheme];
  
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
      case 'CABLE_AEREO': return <Train size={24} color={colors.primary} />;
      case 'BUS_URBANO': return <Bus size={24} color={colors.primary} />;
      case 'BUSETA': return <Navigation size={24} color={colors.primary} />;
      default: return <Bus size={24} color={colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{isAdmin ? "Gestionar Transporte" : "Mis Categorías"}</Text>
        {isAdmin ? (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/admin/edit-transport-type')}
          >
            <Plus size={24} color={colors.onPrimary} />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>


      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (

        <ScrollView contentContainerStyle={styles.scroll}>
          {types.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline + '20' }, uiShadows.sm]}
              onPress={() => router.push({ pathname: '/admin/routes', params: { typeId: item.id, typeName: item.name } })}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>{getIcon(item.type)}</View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
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
                    <Edit2 size={20} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    style={styles.actionBtn}
                  >
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>

          ))}

          {types.length === 0 && (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No hay tipos de transporte configurados.</Text>
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
  },

  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  addButton: {
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
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
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
    fontSize: 16,
  },
});