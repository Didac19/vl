import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, Plus, Trash2, MapPin, DollarSign, GripVertical, Info } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes, useRouteFares, useCreateRoute, useUpdateRoute } from '../../lib/queries';
import { PricingStrategy, CreateRouteDto, CreateStopDto, CreatePointToPointFareDto, TransportTypeDto } from '@transix/shared-types';
import { theme } from '../../constants/theme';

const StopItem = React.memo(({ stop, index, drag, isActive, onUpdate, onRemove }: any) => {
  return (
    <ScaleDecorator>
      <View style={[styles.stopCard, isActive && { backgroundColor: theme.colors.neutral[100], borderColor: theme.colors.primary.esmeralda }]}>
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={100}
          style={styles.dragHandle}
        >
          <GripVertical size={20} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
        <View style={styles.stopOrder}>
          <Text style={styles.stopOrderText}>{stop.order}</Text>
        </View>
        <View style={styles.stopForm}>
          <TextInput
            style={styles.stopInput}
            value={stop.name}
            onChangeText={(text) => onUpdate(index, 'name', text)}
            placeholder="Nombre de la parada"
          />
          <View style={styles.coordRow}>
            <TextInput
              style={[styles.stopInput, { flex: 1, marginBottom: 0 }]}
              value={stop.lat.toString()}
              onChangeText={(text) => onUpdate(index, 'lat', parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholder="Lat"
            />
            <TextInput
              style={[styles.stopInput, { flex: 1, marginBottom: 0 }]}
              value={stop.lng.toString()}
              onChangeText={(text) => onUpdate(index, 'lng', parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholder="Lng"
            />
          </View>
        </View>
        <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeBtn}>
          <Trash2 size={20} color={theme.colors.semantic.error} />
        </TouchableOpacity>
      </View>
    </ScaleDecorator>
  );
});

export default function AdminEditRouteScreen() {
  const router = useRouter();
  const { id, typeId } = useLocalSearchParams();
  const isEditing = !!id;

  const { data: transportTypes, isLoading: isLoadingTypes } = useTransportRoutes();

  // Conditionally fetch fares if we're editing
  const { data: apiFares, isLoading: isLoadingFares } = useRouteFares(id as string);

  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();

  const [form, setForm] = useState<Omit<CreateRouteDto, 'transportTypeId'>>({
    name: '',
    pricingStrategy: 'FLAT',
    baseFare: 0,
    stops: [],
    fares: [],
  });

  const [activeTab, setActiveTab] = useState<'BASIC' | 'STOPS' | 'FARES'>('BASIC');

  const route = transportTypes?.find(t => t.id === typeId)?.routes.find(r => r.id === id);
  const loading = isEditing ? (isLoadingTypes || isLoadingFares) : false;

  useEffect(() => {
    if (isEditing && route && apiFares) {
      // Map stops and fares back to create format
      const stops = route.stops.sort((a: any, b: any) => a.order - b.order).map((s: any) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        order: s.order,
      }));

      const fares = apiFares.map((f: any) => {
        const originIdx = route.stops.findIndex((s: any) => s.id === f.originStopId);
        const destIdx = route.stops.findIndex((s: any) => s.id === f.destinationStopId);
        return {
          originStopIndex: originIdx,
          destinationStopIndex: destIdx,
          fareAmount: f.fareAmount,
        };
      });

      setForm({
        name: route.name,
        pricingStrategy: route.pricingStrategy,
        baseFare: route.baseFare,
        stops,
        fares,
      });
    }
  }, [isEditing, route, apiFares]);

  const handleAddStop = () => {
    const newStop: any = {
      id: `new-${Date.now()}`,
      name: '',
      lat: 5.067,
      lng: -75.517,
      order: (form.stops?.length || 0) + 1,
    };
    setForm({ ...form, stops: [...(form.stops || []), newStop] });
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...(form.stops || [])];
    newStops.splice(index, 1);
    // Reorder remaining stops
    const reorderedStops = newStops.map((s, i) => ({ ...s, order: i + 1 }));

    // Also remove any fares associated with this stop
    const newFares = (form.fares || []).filter(f =>
      f.originStopIndex !== index && f.destinationStopIndex !== index
    ).map(f => ({
      ...f,
      originStopIndex: f.originStopIndex > index ? f.originStopIndex - 1 : f.originStopIndex,
      destinationStopIndex: f.destinationStopIndex > index ? f.destinationStopIndex - 1 : f.destinationStopIndex,
    }));

    setForm({ ...form, stops: reorderedStops, fares: newFares });
  };

  const handleUpdateStop = (index: number, field: keyof CreateStopDto, value: any) => {
    const newStops = [...(form.stops || [])];
    newStops[index] = { ...newStops[index], [field]: value };
    setForm({ ...form, stops: newStops });
  };

  const handleAddFare = () => {
    if ((form.stops?.length || 0) < 2) {
      Alert.alert("Validación", "Debes tener al menos 2 paradas para configurar tarifas.");
      return;
    }
    const newFare: CreatePointToPointFareDto = {
      originStopIndex: 0,
      destinationStopIndex: 1,
      fareAmount: form.baseFare,
    };
    setForm({ ...form, fares: [...(form.fares || []), newFare] });
  };

  const handleRemoveFare = (index: number) => {
    const newFares = [...(form.fares || [])];
    newFares.splice(index, 1);
    setForm({ ...form, fares: newFares });
  };

  const handleUpdateFare = (index: number, field: keyof CreatePointToPointFareDto, value: any) => {
    const newFares = [...(form.fares || [])];
    newFares[index] = { ...newFares[index], [field]: value };
    setForm({ ...form, fares: newFares });
  };

  const handleSave = async () => {
    if (!form.name || form.baseFare < 0) {
      Alert.alert("Validación", "Completa la información básica.");
      return;
    }

    if (form.pricingStrategy === 'POINT_TO_POINT' && (form.fares?.length || 0) === 0) {
      Alert.alert("Validación", "Una ruta de Punto a Punto requiere al menos una tarifa configurada.");
      return;
    }

    try {
      const payload = { ...form, transportTypeId: typeId as string };
      if (isEditing) {
        await updateRoute.mutateAsync({ id: id as string, data: payload });
      } else {
        await createRoute.mutateAsync(payload);
      }
      router.back();
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert("Error", "No se pudo guardar la ruta.");
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={theme.colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={styles.title}>{isEditing ? 'Editar Ruta' : 'Nueva Ruta'}</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={createRoute.isPending || updateRoute.isPending}>
            {(createRoute.isPending || updateRoute.isPending) ? <ActivityIndicator size="small" color="white" /> : <Save size={24} color="white" />}
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'BASIC' && styles.activeTab]}
            onPress={() => setActiveTab('BASIC')}
          >
            <Text style={[styles.tabText, activeTab === 'BASIC' && styles.activeTabText]}>Básico</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'STOPS' && styles.activeTab]}
            onPress={() => setActiveTab('STOPS')}
          >
            <Text style={[styles.tabText, activeTab === 'STOPS' && styles.activeTabText]}>Paradas</Text>
          </TouchableOpacity>
          {form.pricingStrategy === 'POINT_TO_POINT' && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'FARES' && styles.activeTab]}
              onPress={() => setActiveTab('FARES')}
            >
              <Text style={[styles.tabText, activeTab === 'FARES' && styles.activeTabText]}>Tarifas</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === 'BASIC' && (
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.section}>
                <Text style={styles.label}>Nombre de la Ruta</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="Ej: Av. Santander (Sideral)"
                />

                <Text style={styles.label}>Estrategia de Precio</Text>
                <View style={styles.strategyContainer}>
                  <TouchableOpacity
                    style={[styles.strategyBtn, form.pricingStrategy === 'FLAT' && styles.strategyBtnActive]}
                    onPress={() => setForm({ ...form, pricingStrategy: 'FLAT' })}
                  >
                    <Text style={[styles.strategyText, form.pricingStrategy === 'FLAT' && styles.strategyTextActive]}>TARIFA FIJA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.strategyBtn, form.pricingStrategy === 'POINT_TO_POINT' && styles.strategyBtnActive]}
                    onPress={() => setForm({ ...form, pricingStrategy: 'POINT_TO_POINT' })}
                  >
                    <Text style={[styles.strategyText, form.pricingStrategy === 'POINT_TO_POINT' && styles.strategyTextActive]}>PUNTO A PUNTO</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Tarifa Base / General (COP)</Text>
                <TextInput
                  style={styles.input}
                  value={form.baseFare.toString()}
                  onChangeText={(text) => setForm({ ...form, baseFare: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="2500"
                />

                <View style={styles.infoBox}>
                  <Info size={16} color={theme.colors.neutral[500]} />
                  <Text style={styles.infoText}>
                    {form.pricingStrategy === 'FLAT'
                      ? 'En Tarifa Fija, el usuario paga este valor sin importar el origen o destino.'
                      : 'En Punto a Punto, debes definir precios específicos en la pestaña "Tarifas".'}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          {activeTab === 'STOPS' && (
            <DraggableFlatList
              data={form.stops || []}
              keyExtractor={(item: any) => item.id || item.name}
              contentContainerStyle={styles.scroll}
              onDragEnd={({ data }: { data: any[] }) => {
                const oldIndexToNewIndex = new Map<number, number>();
                data.forEach((stop: any, newIndex: number) => {
                  oldIndexToNewIndex.set(stop.order - 1, newIndex);
                });

                const newStops = data.map((s: any, i: number) => ({ ...s, order: i + 1 }));

                const newFares = (form.fares || []).map(fare => ({
                  ...fare,
                  originStopIndex: oldIndexToNewIndex.has(fare.originStopIndex)
                    ? oldIndexToNewIndex.get(fare.originStopIndex)!
                    : fare.originStopIndex,
                  destinationStopIndex: oldIndexToNewIndex.has(fare.destinationStopIndex)
                    ? oldIndexToNewIndex.get(fare.destinationStopIndex)!
                    : fare.destinationStopIndex,
                }));

                setForm({ ...form, stops: newStops, fares: newFares });
              }}
              renderItem={({ item, getIndex, drag, isActive }: any) => (
                <StopItem
                  stop={item}
                  index={getIndex()}
                  drag={drag}
                  isActive={isActive}
                  onUpdate={handleUpdateStop}
                  onRemove={handleRemoveStop}
                />
              )}
              ListHeaderComponent={
                <View style={[styles.sectionHeader, { marginBottom: 16 }]}>
                  <Text style={styles.label}>Paradas en Orden</Text>
                  <TouchableOpacity style={styles.addSmallBtn} onPress={handleAddStop}>
                    <Plus size={16} color="white" />
                    <Text style={styles.addSmallBtnText}>Añadir</Text>
                  </TouchableOpacity>
                </View>
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay paradas definidas.</Text>
              }
            />
          )}

          {activeTab === 'FARES' && (
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Tabla de Tarifas</Text>
                <TouchableOpacity style={styles.addSmallBtn} onPress={handleAddFare}>
                  <Plus size={16} color="white" />
                  <Text style={styles.addSmallBtnText}>Añadir Tarifa</Text>
                </TouchableOpacity>
              </View>

              {(form.fares || []).map((fare, index) => (
                <View key={index} style={styles.fareCard}>
                  <View style={styles.fareFlow}>
                    <View style={styles.fareSelector}>
                      <Text style={styles.fareLabel}>Desde:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.stopPills}>
                          {form.stops?.map((s, sIdx) => (
                            <TouchableOpacity
                              key={sIdx}
                              style={[styles.stopPill, fare.originStopIndex === sIdx && styles.stopPillActive]}
                              onPress={() => handleUpdateFare(index, 'originStopIndex', sIdx)}
                            >
                              <Text style={[styles.stopPillText, fare.originStopIndex === sIdx && styles.stopPillTextActive]}>
                                {s.name || `P${sIdx + 1}`}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.fareSelector}>
                      <Text style={styles.fareLabel}>Hacia:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.stopPills}>
                          {form.stops?.map((s, sIdx) => (
                            <TouchableOpacity
                              key={sIdx}
                              style={[styles.stopPill, fare.destinationStopIndex === sIdx && styles.stopPillActive]}
                              onPress={() => handleUpdateFare(index, 'destinationStopIndex', sIdx)}
                            >
                              <Text style={[styles.stopPillText, fare.destinationStopIndex === sIdx && styles.stopPillTextActive]}>
                                {s.name || `P${sIdx + 1}`}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.fareInputRow}>
                      <DollarSign size={20} color={theme.colors.primary.esmeralda} />
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        value={fare.fareAmount.toString()}
                        onChangeText={(text) => handleUpdateFare(index, 'fareAmount', parseInt(text) || 0)}
                        keyboardType="numeric"
                        placeholder="Valor"
                      />
                      <TouchableOpacity onPress={() => handleRemoveFare(index)} style={styles.removeBtn}>
                        <Trash2 size={20} color={theme.colors.semantic.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {(form.fares || []).length === 0 && (
                <Text style={styles.emptyText}>No hay tarifas configuradas para esta ruta.</Text>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary.esmeralda,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[500],
  },
  activeTabText: {
    color: theme.colors.primary.esmeralda,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  strategyContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.neutral[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  strategyBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  strategyBtnActive: {
    backgroundColor: 'white',
    ...theme.shadows.sm,
  },
  strategyText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.neutral[500],
  },
  strategyTextActive: {
    color: theme.colors.primary.esmeralda,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.neutral[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.neutral[600],
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary.esmeralda,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addSmallBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.neutral[50],
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  dragHandle: {
    padding: 4,
    marginRight: -4,
  },
  stopOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.esmeralda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopOrderText: {
    color: 'white',
    fontWeight: '700',
  },
  stopForm: {
    flex: 1,
  },
  stopInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    marginBottom: 8,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  removeBtn: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.neutral[500],
    marginTop: 20,
  },
  fareCard: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  fareFlow: {
    gap: 12,
  },
  fareSelector: {
    gap: 8,
  },
  fareLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.neutral[600],
  },
  stopPills: {
    flexDirection: 'row',
    gap: 8,
  },
  stopPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  stopPillActive: {
    backgroundColor: theme.colors.primary.esmeralda,
    borderColor: theme.colors.primary.esmeralda,
  },
  stopPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.neutral[600],
  },
  stopPillTextActive: {
    color: 'white',
  },
  fareInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: 12,
  },
});