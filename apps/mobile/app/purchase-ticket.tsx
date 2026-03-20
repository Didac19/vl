import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Ticket, Bus, ArrowRight, Expand, Info, Train, MapPin } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { api } from '../lib/api';
import { PointToPointFareDto } from '@via-libre/shared-types';

const colors = {
  // ... existing colors
  background: "#fcf9f5",
  onBackground: "#1c1c1a",
  surface: "#fcf9f5",
  onSurface: "#1c1c1a",
  onSurfaceVariant: "#3e4a3f",
  primary: "#006a37",
  onPrimary: "#ffffff",
  primaryContainer: "#008647",
  onPrimaryContainer: "#f6fff4",
  secondary: "#9e4127",
  onSecondary: "#ffffff",
  tertiary: "#705740",
  onTertiary: "#ffffff",
  tertiaryFixedDim: "#e1c1a4",
  onTertiaryFixedVariant: "#59422c",
  surfaceContainerLow: "#f6f3ef",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#ebe8e4",
  surfaceContainerHighest: "#e5e2de",
  outlineVariant: "#bdcabc",
};

export default function PurchaseTicketScreen() {
  const router = useRouter();
  const { transportId, transportTitle, transportType, baseFare, originStopId, destinationStopId } = useLocalSearchParams();
  const [calculatedFare, setCalculatedFare] = useState<number>(Number(baseFare) || 0);
  const [loadingFare, setLoadingFare] = useState(false);

  useEffect(() => {
    if (originStopId && destinationStopId && transportId) {
      fetchP2PFare();
    }
  }, [originStopId, destinationStopId, transportId]);

  const fetchP2PFare = async () => {
    setLoadingFare(true);
    try {
      const response = await api.get(`/transport/routes/${transportId}/fares`);
      const fares: PointToPointFareDto[] = response.data;
      const match = fares.find(f => f.originStopId === originStopId && f.destinationStopId === destinationStopId);
      if (match) {
        setCalculatedFare(match.fareAmount);
      }
    } catch (error) {
      console.error('Error fetching P2P fare:', error);
    } finally {
      setLoadingFare(false);
    }
  };

  const getTransportConfig = () => {
    const formattedFare = `$${calculatedFare.toLocaleString()}`;

    switch (transportType) {
      case 'CABLE_AEREO':
        return {
          subtitle: 'Viaja por el cielo de Manizales conectando el centro con Villamaría de forma ecológica.',
          mainTicket: { title: 'Pasaje Único', price: formattedFare, icon: <Train size={32} color={colors.secondary} /> },
          options: [
            { title: 'Estudiantil', price: '$1.800', info: 'Con carné vigente', icon: <ArrowRight size={20} color={colors.tertiary} /> },
            { title: 'Adulto Mayor', price: '$2.000', info: 'Mayores de 65', icon: <Expand size={20} color={colors.primary} /> }
          ]
        };
      case 'BUS_URBANO':
        return {
          subtitle: 'Servicio de buses por las avenidas principales: Santander, Paralela y Kevin Ángel.',
          mainTicket: { title: 'Pasaje Urbano', price: formattedFare, icon: <Bus size={32} color={colors.primary} /> },
          options: [
            { title: 'Ruta Circular', price: formattedFare, info: 'Todo el día', icon: <ArrowRight size={20} color={colors.tertiary} /> },
            { title: 'Transbordo', price: '$500', info: 'Entre rutas urbanas', icon: <Expand size={20} color={colors.secondary} /> }
          ]
        };
      case 'BUSETA':
        return {
          subtitle: 'Transporte rápido y flexible que llega a todos los barrios de la ciudad.',
          mainTicket: { title: 'Pasaje Buseta', price: formattedFare, icon: <Bus size={32} color={colors.tertiary} /> },
          options: [
            { title: 'Colectivo', price: '$2.800', info: 'Servicio expreso', icon: <ArrowRight size={20} color={colors.secondary} /> },
            { title: 'Nocturno', price: '$3.000', info: 'Después de las 10 PM', icon: <Expand size={20} color={colors.primary} /> }
          ]
        };
      case 'INTERMUNICIPAL':
      default:
        return {
          subtitle: 'Conexión desde la terminal de transportes hacia municipios cercanos.',
          mainTicket: { title: transportTitle || 'Pasaje', price: formattedFare, icon: <Bus size={32} color={colors.onSurfaceVariant} /> },
          options: [
            { title: 'Villamaría', price: '$2.500', icon: <ArrowRight size={20} color={colors.tertiary} /> },
            { title: 'Chinchiná', price: '$4.500', info: 'Frecuencia 15 min', icon: <Expand size={20} color={colors.secondary} /> }
          ]
        };
    }
  };

  const config = getTransportConfig();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* TopAppBar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.logoText}>Compra</Text>
        </View>
        <View style={styles.avatarBorder}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.moduleBadge}>
            <Ticket size={14} color={colors.secondary} fill={colors.secondary} />
            <Text style={styles.moduleBadgeText}>MÓDULO DE COMPRA</Text>
          </View>
          <Text style={styles.title}>Compra Pasaje: {transportTitle || 'SITP'}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>

        {/* Route Details (if P2P) */}
        {originStopId && destinationStopId && (
          <View style={styles.routeDetails}>
            <View style={styles.routeDetailItem}>
              <MapPin size={16} color={colors.primary} />
              <Text style={styles.routeDetailText}>Origen seleccionado</Text>
            </View>
            <View style={styles.routeConnector} />
            <View style={styles.routeDetailItem}>
              <MapPin size={16} color={colors.secondary} />
              <Text style={styles.routeDetailText}>Destino seleccionado</Text>
            </View>
          </View>
        )}

        {/* Ticket Options Grid */}
        <View style={styles.grid}>
          {/* Main Option */}
          <TouchableOpacity style={styles.mainCard} activeOpacity={0.9} disabled={loadingFare}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                {config.mainTicket.icon}
              </View>
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
              </View>
            </View>
            <View>
              <Text style={styles.cardTitle}>{config.mainTicket.title}</Text>
              {loadingFare ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
              ) : (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceValue}>{config.mainTicket.price}</Text>
                  <Text style={styles.priceCurrency}>COP</Text>
                </View>
              )}
            </View>
            <View style={styles.buyNow}>
              <Text style={styles.buyNowText}>Comprar ahora</Text>
              <ArrowRight size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.smallCardsRow}>
            {/* Small Options */}
            {config.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.smallCard,
                  index === 0 ? { backgroundColor: colors.surfaceContainerHigh } : { backgroundColor: 'rgba(158, 65, 39, 0.05)', borderColor: 'rgba(158, 65, 39, 0.1)', borderWidth: 1 }
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.smallCardIcon}>
                  {option.icon}
                </View>
                <Text style={styles.smallCardTitle}>{option.title}</Text>
                <Text style={[styles.smallCardPrice, index === 1 && { color: colors.secondary }]}>{option.price}</Text>
                {option.info && <Text style={styles.smallCardInfo}>{option.info}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <View style={styles.cardVisual}>
                <View style={styles.cardGradient}>
                  <Text style={styles.cardBrand}>VISA</Text>
                </View>
              </View>
              <View>
                <Text style={styles.paymentName}>Tu Llave Plus</Text>
                <Text style={styles.paymentDetail}>Termina en •••• 4291</Text>
              </View>
            </View>
            <Expand size={20} color={colors.onSurfaceVariant} />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Info size={20} color={colors.tertiary} />
          <Text style={styles.infoText}>
            Recuerda que tienes hasta 110 minutos para realizar trasbordos entre buses zonales y troncales sin costo adicional o con un valor mínimo.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
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
    backgroundColor: 'rgba(6, 78, 59, 0.9)', // emerald-900/90
    height: 72,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 95, 70, 0.3)', // emerald-800/30
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.5)', // emerald-700/50
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  headerSection: {
    marginBottom: 24,
  },
  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onBackground,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 20,
  },
  routeDetails: {
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  routeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  routeConnector: {
    width: 2,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginLeft: 7,
    marginVertical: 4,
  },
  grid: {
    gap: 16,
  },
  mainCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(110, 122, 110, 0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  iconContainer: {
    backgroundColor: 'rgba(0, 106, 55, 0.1)',
    padding: 12,
    borderRadius: 20,
  },
  popularBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
  },
  priceCurrency: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  buyNow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  smallCardsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  smallCard: {
    flex: 1,
    borderRadius: 32,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  smallCardIcon: {
    marginBottom: 12,
  },
  smallCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  smallCardPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.tertiary,
    marginTop: 4,
  },
  smallCardInfo: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(112, 87, 64, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  paymentSection: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(110, 122, 110, 0.2)',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardVisual: {
    width: 48,
    height: 32,
    backgroundColor: '#1c1917',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBrand: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  paymentDetail: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  infoCard: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: 'rgba(225, 193, 164, 0.2)',
    borderRadius: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.onTertiaryFixedVariant,
    lineHeight: 18,
  },
});
