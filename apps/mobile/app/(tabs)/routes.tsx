import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Search, MapPin, Navigation, Train, Bus, Info, ChevronRight } from 'lucide-react-native';
import { theme } from '../../constants/theme';

export default function RoutesScreen() {
  const [transportFilter, setTransportFilter] = useState('ALL');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planear Ruta</Text>
      </View>

      <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={styles.scrollContent}>
        {/* Input de Destino */}
        <View style={styles.searchSection}>
          <View style={styles.inputGroup}>
            <View style={styles.dotCurrent} />
            <TextInput style={styles.input} placeholder="Mi ubicación actual" placeholderTextColor={theme.colors.neutral[400]} />
          </View>
          <View style={styles.inputDivider} />
          <View style={styles.inputGroup}>
            <MapPin size={18} color={theme.colors.secondary.terracota} />
            <TextInput style={styles.input} placeholder="¿A dónde vas?" placeholderTextColor={theme.colors.neutral[400]} />
          </View>
        </View>

        {/* Filtros de Transporte */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map((f) => (
              <TouchableOpacity 
                key={f.id} 
                onPress={() => setTransportFilter(f.id)}
                style={[styles.filterChip, transportFilter === f.id && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, transportFilter === f.id && styles.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Rutas Recomendadas</Text>

        {/* Listado de Rutas (Mock) */}
        <View style={styles.routesList}>
          {mockRoutes.filter(r => transportFilter === 'ALL' || r.type === transportFilter).map((route, i) => (
            <TouchableOpacity key={i} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <View style={[styles.routeType, { backgroundColor: route.color }]}>
                  {route.type === 'TM' ? <Train size={16} color="white" /> : <Bus size={16} color="white" />}
                  <Text style={styles.routeTypeText}>{route.typeName}</Text>
                </View>
                <View style={styles.routeTiming}>
                  <Text style={styles.routeDuration}>{route.duration} min</Text>
                  <Text style={styles.routeFare}>${route.fare}</Text>
                </View>
              </View>
              
              <Text style={styles.routeName}>{route.name}</Text>
              
              <View style={styles.routeFooter}>
                <View style={styles.routeMeta}>
                  <Navigation size={12} color={theme.colors.neutral[500]} />
                  <Text style={styles.routeMetaText}>Próximo en {route.next} min</Text>
                </View>
                <TouchableOpacity style={styles.buyBtn}>
                  <Text style={styles.buyBtnText}>Comprar Pasaje</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const filters = [
  { id: 'ALL', label: 'Todos' },
  { id: 'TM', label: 'TransMilenio' },
  { id: 'SITP', label: 'SITP' },
  { id: 'COOP', label: 'Cooperativas' },
  { id: 'MB', label: 'Microbús' },
];

const mockRoutes = [
  { id: '1', name: 'B18 - Portal Norte - Cll 72', type: 'TM', typeName: 'TransMilenio', duration: '32', fare: '2.950', next: '4', color: theme.colors.transport.transmilenio },
  { id: '2', name: '302 - San Cristóbal Norte', type: 'SITP', typeName: 'SITP', duration: '55', fare: '2.950', next: '12', color: theme.colors.transport.sitp },
  { id: '3', name: 'Flota Zipaquirá - Bogotá', type: 'COOP', typeName: 'Cooperativa', duration: '85', fare: '9.000', next: '15', color: theme.colors.transport.cooperativa },
  { id: '4', name: 'Usaquén - Suba (Micro)', type: 'MB', typeName: 'Microbús', duration: '45', fare: '2.300', next: '8', color: theme.colors.transport.microbus },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  header: {
    padding: theme.spacing[4],
    backgroundColor: 'white',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.neutral[900],
    fontFamily: theme.typography.fontFamily.sans,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    backgroundColor: 'white',
    padding: theme.spacing[4],
    margin: theme.spacing[4],
    borderRadius: 16,
    ...theme.shadows.md,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  dotCurrent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: theme.colors.primary.esmeralda,
    marginLeft: 4,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.neutral[900],
  },
  inputDivider: {
    height: 30,
    width: 1,
    backgroundColor: theme.colors.neutral[200],
    marginLeft: 8,
    marginVertical: 4,
  },
  filterSection: {
    backgroundColor: theme.colors.neutral[50],
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  filterScroll: {
    paddingHorizontal: theme.spacing[4],
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary.esmeralda,
    borderColor: theme.colors.primary.esmeralda,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[600],
  },
  filterTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
    marginHorizontal: theme.spacing[4],
  },
  routesList: {
    paddingHorizontal: theme.spacing[4],
    gap: 16,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
    ...theme.shadows.sm,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  routeTiming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDuration: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  routeFare: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontWeight: '500',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 16,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[50],
  },
  routeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeMetaText: {
    fontSize: 12,
    color: theme.colors.neutral[600],
  },
  buyBtn: {
    backgroundColor: theme.colors.primary.esmeraldaPale,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyBtnText: {
    color: theme.colors.primary.esmeralda,
    fontWeight: '700',
    fontSize: 13,
  },
});
