import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bus, Navigation, Info, Train } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes } from '../lib/queries';
import { TransportTypeDto, RouteDto, TransportType } from '@transix/shared-types';
import { getRouteDisplayName } from '../lib/utils';

const colors = {
  background: "#fcf9f5",
  surface: "#fcf9f5",
  primary: "#006a37",
  onPrimary: "#ffffff",
  primaryContainer: "#008647",
  onPrimaryContainer: "#f6fff4",
  secondary: "#9e4127",
  onSecondary: "#ffffff",
  secondaryContainer: "#ff8b6b",
  onSecondaryContainer: "#75230b",
  tertiary: "#705740",
  onTertiary: "#ffffff",
  tertiaryContainer: "#8a7057",
  onTertiaryContainer: "#fffbff",
  tertiaryFixed: "#fedcbe",
  onTertiaryFixedVariant: "#59422c",
  surfaceContainerLow: "#f6f3ef",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHighest: "#e5e2de",
  onSurface: "#1c1c1a",
  onSurfaceVariant: "#3e4a3f",
  outline: "#6e7a6e",
  manizalesYellow: "#FFD700",
  manizalesGreen: "#008000",
};

export default function TransportSelectionScreen() {
  const router = useRouter();
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [originStopId, setOriginStopId] = useState<string | null>(null);
  const [destinationStopId, setDestinationStopId] = useState<string | null>(null);

  const { data: transportTypes = [], isLoading: loading } = useTransportRoutes();

  const selectedType = transportTypes.find(t => t.id === selectedTypeId);
  const filteredRoutes = selectedType?.routes || [];
  const selectedRoute = filteredRoutes.find(r => r.id === selectedRouteId);

  const getTransportIcon = (type: TransportType) => {
    switch (type) {
      case 'CABLE_AEREO': return <Train size={32} color={colors.secondary} />;
      case 'BUS_URBANO': return <Bus size={32} color={colors.manizalesGreen} />;
      case 'BUSETA': return <Navigation size={32} color={colors.manizalesYellow} />;
      default: return <Navigation size={32} color={colors.tertiary} />;
    }
  };

  const getBgColors = (type: TransportType) => {
    switch (type) {
      case 'CABLE_AEREO': return { bgIcon: 'rgba(158, 65, 39, 0.1)', shape: 'rgba(158, 65, 39, 0.05)' };
      case 'BUS_URBANO': return { bgIcon: 'rgba(0, 128, 0, 0.1)', shape: 'rgba(0, 128, 0, 0.05)' };
      case 'BUSETA': return { bgIcon: 'rgba(255, 215, 0, 0.1)', shape: 'rgba(255, 215, 0, 0.05)' };
      default: return { bgIcon: 'rgba(112, 87, 64, 0.1)', shape: 'rgba(112, 87, 64, 0.05)' };
    }
  };

  const handleTypeSelect = (type: TransportTypeDto) => {
    setSelectedTypeId(type.id);
    if (!type.requiresRouteSelection) {
      const routeId = type.routes[0]?.id;
      router.push({
        pathname: '/purchase-ticket',
        params: {
          transportId: routeId,
          transportTitle: type.name,
          transportType: type.type,
          fareAmount: type.fareAmount
        }
      });
    }
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(routeId);
    const route = filteredRoutes.find(r => r.id === routeId);
    if (route?.pricingStrategy === 'FLAT') {
      // If flat, we can continue directly or wait for "Confirmar"
    }
  };

  const handleContinue = () => {
    if (selectedRouteId && selectedType && selectedRoute) {
      router.push({
        pathname: '/purchase-ticket',
        params: {
          transportId: selectedRouteId,
          transportTitle: getRouteDisplayName(selectedRoute),
          transportType: selectedType.type,
          baseFare: selectedRoute.baseFare,
          originStopId: originStopId || '',
          destinationStopId: destinationStopId || '',
        }
      });
    }
  };

  const handleBack = () => {
    if (destinationStopId) {
      setDestinationStopId(null);
    } else if (originStopId) {
      setOriginStopId(null);
    } else if (selectedRouteId) {
      setSelectedRouteId(null);
    } else if (selectedTypeId) {
      setSelectedTypeId(null);
    } else {
      router.back();
    }
  };

  const isPointToPoint = selectedRoute?.pricingStrategy === 'POINT_TO_POINT';
  const showStops = isPointToPoint && selectedRouteId;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <ChevronLeft size={28} color="#047857" />
          </TouchableOpacity>
          <Text style={styles.logoText}>
            {originStopId ? 'Destino' : originStopId === null && selectedRouteId && isPointToPoint ? 'Origen' : selectedTypeId ? 'Rutas' : 'Selecciona'}
          </Text>
        </View>
        <View style={styles.avatarBorder}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMb3G5UBVmq2fJwt3w0owHxmIzYjZdAAfa-v7IsPtDMy8QZcg4bXVGyS_eiwmifsPnejbwK1qdj8_RV3Zye2PCAuuA8prZgWg2lM97s4H7f76N4o5Hl__yY9aFFQwxhSE7CN_iIbPZBLdPiuMNEvlTwjg-utP_KqDMZczAZ5vNBn2EZ9gFiHCmaJVemq9Hx6nanQoG_qCRebEhs1-TzzaJdw0fMx3PJ-pdCjgw2lz-8JzEtmpsN8GKXJJA1p-pt9Q4t0zCPmZRqBEV' }}
            style={styles.avatarImage}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headlineSection}>
          <Text style={styles.headlineTitle}>
            {showStops ? (originStopId ? '¿A dónde vas?' : '¿Dónde inicias?') : selectedTypeId ? '¿Cuál es tu ruta?' : '¿Cómo te moverás hoy?'}
          </Text>
          <Text style={styles.headlineSubtitle}>
            {showStops ? 'Selecciona las paradas de tu trayecto' : selectedTypeId ? `Mostrando rutas de ${selectedType?.name}` : 'Explora las opciones de transporte en Manizales'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {!selectedTypeId ? (
              // Step 1: Transport Types
              transportTypes.map((type) => {
                const { bgIcon, shape } = getBgColors(type.type);
                return (
                  <TouchableOpacity key={type.id} activeOpacity={0.7} onPress={() => handleTypeSelect(type)} style={styles.card}>
                    <View style={[styles.cardShape, { backgroundColor: shape }]} />
                    <View style={styles.cardContent}>
                      <View style={[styles.iconContainer, { backgroundColor: bgIcon }]}>{getTransportIcon(type.type)}</View>
                      <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>{type.name}</Text>
                        <Text style={styles.cardSubtitle}>Tarifa base: ${(type.fareAmount).toLocaleString()}</Text>
                      </View>
                      <ChevronLeft size={20} color={colors.outline} style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : !selectedRouteId ? (
              // Step 2: Routes
              filteredRoutes.map((route) => {
                const { bgIcon, shape } = getBgColors(selectedType!.type);
                return (
                  <TouchableOpacity key={route.id} activeOpacity={0.7} onPress={() => handleRouteSelect(route.id)} style={[styles.card, selectedRouteId === route.id && styles.activeCard]}>
                    <View style={[styles.cardShape, { backgroundColor: shape }]} />
                    <View style={styles.cardContent}>
                      <View style={[styles.iconContainer, { backgroundColor: bgIcon }]}>{getTransportIcon(selectedType!.type)}</View>
                      <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>{route.name}</Text>
                        <Text style={styles.cardSubtitle}>{route.pricingStrategy === 'FLAT' ? `Tarifa única: $${route.baseFare.toLocaleString()}` : 'Tarifa por trayecto'}</Text>
                      </View>
                      <View style={[styles.radioCircle, selectedRouteId === route.id && styles.radioCircleActive]}>
                        {selectedRouteId === route.id && <View style={styles.radioInner} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : isPointToPoint ? (
              // Step 3: Origin/Destination for Point to Point
              !originStopId ? (
                selectedRoute?.stops?.map(stop => (
                  <TouchableOpacity key={stop.id} style={styles.card} onPress={() => setOriginStopId(stop.id)}>
                    <View style={styles.cardContent}>
                      <View style={[styles.iconContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}><Navigation size={24} color={colors.outline} /></View>
                      <Text style={styles.cardTitle}>{stop.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                selectedRoute?.stops?.filter(s => s.id !== originStopId).map(stop => (
                  <TouchableOpacity key={stop.id} style={[styles.card, destinationStopId === stop.id && styles.activeCard]} onPress={() => setDestinationStopId(stop.id)}>
                    <View style={styles.cardContent}>
                      <View style={[styles.iconContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}><Navigation size={24} color={colors.outline} /></View>
                      <Text style={styles.cardTitle}>{stop.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : (
              // Step 2 Continued: Flat Route confirmation
              <View style={[styles.card, styles.activeCard]}>
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 106, 55, 0.1)' }]}><Train size={32} color={colors.primary} /></View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{selectedRoute.name}</Text>
                    <Text style={styles.cardSubtitle}>Tarifa: ${selectedRoute.baseFare.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {selectedRouteId && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              ((isPointToPoint && !destinationStopId) || (!isPointToPoint && !selectedRouteId)) && styles.continueButtonDisabled
            ]}
            disabled={isPointToPoint ? !destinationStopId : !selectedRouteId}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonTextActive}>
              {isPointToPoint ? 'Confirmar Trayecto' : 'Confirmar Ruta'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    height: 64,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: "#065f46", // emerald-800
    fontStyle: 'italic',
  },
  avatarBorder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  headlineSection: {
    marginBottom: 40,
  },
  headlineTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headlineSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.tertiary,
    opacity: 0.8,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: colors.primary,
    backgroundColor: "#f6fff4",
  },
  cardShape: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    backgroundColor: colors.primary,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  continueButtonTextActive: {
    color: 'white',
  },
  continueButtonTextDisabled: {
    color: colors.outline,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
});
