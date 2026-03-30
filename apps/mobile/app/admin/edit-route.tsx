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
import { theme as uiTheme } from '../../constants/theme';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';


const StopItem = React.memo(({ stop, index, drag, isActive, onUpdate, onRemove }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <ScaleDecorator>
      <View style={[styles.stopCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline + '20' }, isActive && { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={100}
          style={styles.dragHandle}
        >
          <GripVertical size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View style={[styles.stopOrder, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stopOrderText, { color: colors.onPrimary }]}>{stop.order}</Text>
        </View>
        <View style={styles.stopForm}>
          <TextInput
            style={[styles.stopInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.outline + '20' }]}
            value={stop.name}
            onChangeText={(text) => onUpdate(index, 'name', text)}
            placeholder="Nombre de la parada"
            placeholderTextColor={colors.onSurfaceVariant + '80'}
          />
          <View style={styles.coordRow}>
            <TextInput
              style={[styles.stopInput, { flex: 1, marginBottom: 0, backgroundColor: colors.surface, color: colors.text, borderColor: colors.outline + '20' }]}
              value={stop.lat.toString()}
              onChangeText={(text) => onUpdate(index, 'lat', parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholder="Lat"
              placeholderTextColor={colors.onSurfaceVariant + '80'}
            />
            <TextInput
              style={[styles.stopInput, { flex: 1, marginBottom: 0, backgroundColor: colors.surface, color: colors.text, borderColor: colors.outline + '20' }]}
              value={stop.lng.toString()}
              onChangeText={(text) => onUpdate(index, 'lng', parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholder="Lng"
              placeholderTextColor={colors.onSurfaceVariant + '80'}
            />
          </View>
        </View>
        <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeBtn}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </ScaleDecorator>
  );
});


export default function AdminEditRouteScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const uiShadows = uiTheme.shadows[colorScheme];

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
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Editar Ruta' : 'Nueva Ruta'}</Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={createRoute.isPending || updateRoute.isPending}>
            {(createRoute.isPending || updateRoute.isPending) ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Save size={24} color={colors.onPrimary} />}
          </TouchableOpacity>
        </View>


        <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.outline + '20' }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'BASIC' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab('BASIC')}
          >
            <Text style={[styles.tabText, { color: colors.onSurfaceVariant }, activeTab === 'BASIC' && { color: colors.primary }]}>Básico</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'STOPS' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab('STOPS')}
          >
            <Text style={[styles.tabText, { color: colors.onSurfaceVariant }, activeTab === 'STOPS' && { color: colors.primary }]}>Paradas</Text>
          </TouchableOpacity>
          {form.pricingStrategy === 'POINT_TO_POINT' && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'FARES' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
              onPress={() => setActiveTab('FARES')}
            >
              <Text style={[styles.tabText, { color: colors.onSurfaceVariant }, activeTab === 'FARES' && { color: colors.primary }]}>Tarifas</Text>
            </TouchableOpacity>
          )}
        </View>


        <View style={{ flex: 1 }}>
          {activeTab === 'BASIC' && (
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outline + '20' }, uiShadows.sm]}>
                <Text style={[styles.label, { color: colors.text }]}>Nombre de la Ruta</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.outline + '10' }]}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="Ej: Av. Santander (Sideral)"
                  placeholderTextColor={colors.onSurfaceVariant + '80'}
                />


                <Text style={[styles.label, { color: colors.text }]}>Estrategia de Precio</Text>
                <View style={[styles.strategyContainer, { backgroundColor: colors.surfaceVariant }]}>
                  <TouchableOpacity
                    style={[styles.strategyBtn, form.pricingStrategy === 'FLAT' && [styles.strategyBtnActive, { backgroundColor: colors.surface }, uiShadows.sm]]}
                    onPress={() => setForm({ ...form, pricingStrategy: 'FLAT' })}
                  >
                    <Text style={[styles.strategyText, { color: colors.onSurfaceVariant }, form.pricingStrategy === 'FLAT' && { color: colors.primary }]}>TARIFA FIJA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.strategyBtn, form.pricingStrategy === 'POINT_TO_POINT' && [styles.strategyBtnActive, { backgroundColor: colors.surface }, uiShadows.sm]]}
                    onPress={() => setForm({ ...form, pricingStrategy: 'POINT_TO_POINT' })}
                  >
                    <Text style={[styles.strategyText, { color: colors.onSurfaceVariant }, form.pricingStrategy === 'POINT_TO_POINT' && { color: colors.primary }]}>PUNTO A PUNTO</Text>
                  </TouchableOpacity>
                </View>


                <Text style={[styles.label, { color: colors.text }]}>Tarifa Base / General (COP)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.outline + '10' }]}
                  value={form.baseFare.toString()}
                  onChangeText={(text) => setForm({ ...form, baseFare: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="2500"
                  placeholderTextColor={colors.onSurfaceVariant + '80'}
                />


                <View style={[styles.infoBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline + '10' }]}>
                  <Info size={16} color={colors.onSurfaceVariant} />
                  <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
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
                  <Text style={[styles.label, { color: colors.text }]}>Paradas en Orden</Text>
                  <TouchableOpacity style={[styles.addSmallBtn, { backgroundColor: colors.primary }]} onPress={handleAddStop}>
                    <Plus size={16} color={colors.onPrimary} />
                    <Text style={[styles.addSmallBtnText, { color: colors.onPrimary }]}>Añadir</Text>
                  </TouchableOpacity>
                </View>
              }

              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No hay paradas definidas.</Text>
              }
创新
创新

            />
          )}

          {activeTab === 'FARES' && (
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: colors.text }]}>Tabla de Tarifas</Text>
                <TouchableOpacity style={[styles.addSmallBtn, { backgroundColor: colors.primary }]} onPress={handleAddFare}>
                  <Plus size={16} color={colors.onPrimary} />
                  <Text style={[styles.addSmallBtnText, { color: colors.onPrimary }]}>Añadir Tarifa</Text>
                </TouchableOpacity>
              </View>


              {(form.fares || []).map((fare, index) => (
                <View key={index} style={[styles.fareCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline + '10' }]}>
                  <View style={styles.fareFlow}>
                    <View style={styles.fareSelector}>
                      <Text style={[styles.fareLabel, { color: colors.onSurfaceVariant }]}>Desde:</Text>

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
                      <Text style={[styles.fareLabel, { color: colors.onSurfaceVariant }]}>Hacia:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.stopPills}>
                          {form.stops?.map((s, sIdx) => (
                            <TouchableOpacity
                              key={sIdx}
                              style={[styles.stopPill, { backgroundColor: colors.surface, borderColor: colors.outline + '20' }, fare.destinationStopIndex === sIdx && [styles.stopPillActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
                              onPress={() => handleUpdateFare(index, 'destinationStopIndex', sIdx)}
                            >
                              <Text style={[styles.stopPillText, { color: colors.onSurfaceVariant }, fare.destinationStopIndex === sIdx && { color: colors.onPrimary }]}>
创新
创新
创新

                                {s.name || `P${sIdx + 1}`}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={[styles.fareInputRow, { borderTopColor: colors.outline + '10' }]}>
                      <DollarSign size={20} color={colors.primary} />
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.surface, color: colors.text, borderColor: colors.outline + '20' }]}
                        value={fare.fareAmount.toString()}
                        onChangeText={(text) => handleUpdateFare(index, 'fareAmount', parseInt(text) || 0)}
                        keyboardType="numeric"
                        placeholder="Valor"
                        placeholderTextColor={colors.onSurfaceVariant + '80'}
                      />
                      <TouchableOpacity onPress={() => handleRemoveFare(index)} style={styles.removeBtn}>
                        <Trash2 size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
创新
 innovation
创新
 innovation
创新
 innovation

                  </View>
                </View>
              ))}

              {(form.fares || []).length === 0 && (
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No hay tarifas configuradas para esta ruta.</Text>
              )}
创新
 innovation
创新
 innovation

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
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  activeTab: {
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
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
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  strategyContainer: {
    flexDirection: 'row',
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
  },
  strategyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  strategyTextActive: {
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  dragHandle: {
    padding: 4,
    marginRight: -4,
  },
  stopOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopOrderText: {
    fontWeight: '700',
  },
  stopForm: {
    flex: 1,
  },
  stopInput: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    borderWidth: 1,
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
    marginTop: 20,
  },
  fareCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
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
  },
  stopPills: {
    flexDirection: 'row',
    gap: 8,
  },
  stopPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  stopPillActive: {
  },
  stopPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stopPillTextActive: {
  },
  fareInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    borderTopWidth: 1,
    paddingTop: 12,
  },
});