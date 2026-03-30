import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bus, Navigation, Info, Train } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransportRoutes } from '../lib/queries';
import { TransportTypeDto, RouteDto, TransportType } from '@transix/shared-types';
import { getRouteDisplayName } from '../lib/utils';
import { useColorScheme } from '../components/useColorScheme';
import Colors from '../constants/Colors';

const getTransportStyles = (type: TransportType, isDark: boolean) => {
  const baseColors = {
    CABLE_AEREO: isDark ? '#E68A75' : '#9e4127',
    BUS_URBANO: isDark ? '#4DB87A' : '#008000',
    BUSETA: isDark ? '#FFEC8B' : '#C5A300',
    DEFAULT: isDark ? '#9E8975' : '#705740',
  };
  
  const color = baseColors[type as keyof typeof baseColors] || baseColors.DEFAULT;
  return {
    color,
    bgIcon: color + '25',
    shape: color + '15',
  };
};

const makeStyles = (colors: any, isDark: boolean) => StyleSheet.create({
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
    height: 64,
    backgroundColor: colors.surface,
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
    letterSpacing: -0.5,
    marginBottom: 8,
    color: colors.text,
  },
  headlineSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      }
    }),
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: isDark ? colors.primary + '15' : '#f6fff4',
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
    marginBottom: 4,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
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
    borderTopWidth: 1,
    backgroundColor: colors.background,
    borderTopColor: colors.outlineVariant,
  },
  continueButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      }
    })
  },
  continueButtonDisabled: {
    backgroundColor: colors.outlineVariant,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 }
    })
  },
  continueButtonTextActive: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});

export default function TransportSelectionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, isDark);

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [originStopId, setOriginStopId] = useState<string | null>(null);
  const [destinationStopId, setDestinationStopId] = useState<string | null>(null);

  const { data: transportTypes = [], isLoading: loading } = useTransportRoutes();

  const selectedType = transportTypes.find(t => t.id === selectedTypeId);
  const filteredRoutes = selectedType?.routes || [];
  const selectedRoute = filteredRoutes.find(r => r.id === selectedRouteId);

  const getTransportIcon = (type: TransportType) => {
    const { color } = getTransportStyles(type, isDark);
    switch (type) {
      case 'CABLE_AEREO': return <Train size={32} color={color} />;
      case 'BUS_URBANO': return <Bus size={32} color={color} />;
      case 'BUSETA': return <Navigation size={32} color={color} />;
      default: return <Navigation size={32} color={color} />;
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <ChevronLeft size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: colors.primary }]}>
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
                const { bgIcon, shape } = getTransportStyles(type.type, isDark);
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
                const { bgIcon, shape } = getTransportStyles(selectedType!.type, isDark);
                return (
                  <TouchableOpacity 
                    key={route.id} 
                    activeOpacity={0.7} 
                    onPress={() => handleRouteSelect(route.id)} 
                    style={[
                      styles.card, 
                      selectedRouteId === route.id && styles.activeCard
                    ]}
                  >
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
                      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}><Navigation size={24} color={colors.outline} /></View>
                      <Text style={styles.cardTitle}>{stop.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                selectedRoute?.stops?.filter(s => s.id !== originStopId).map(stop => (
                  <TouchableOpacity 
                    key={stop.id} 
                    style={[
                      styles.card, 
                      destinationStopId === stop.id && styles.activeCard
                    ]} 
                    onPress={() => setDestinationStopId(stop.id)}
                  >
                    <View style={styles.cardContent}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}><Navigation size={24} color={colors.outline} /></View>
                      <Text style={styles.cardTitle}>{stop.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : (
              // Step 2 Continued: Flat Route confirmation
              <View style={[styles.card, styles.activeCard]}>
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}><Train size={32} color={colors.primary} /></View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{selectedRoute?.name}</Text>
                    <Text style={styles.cardSubtitle}>Tarifa: ${selectedRoute?.baseFare.toLocaleString()}</Text>
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
