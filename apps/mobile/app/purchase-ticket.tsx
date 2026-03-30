import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Ticket, Bus, ArrowRight, Expand, Info, Train, MapPin } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouteFares } from '../lib/queries';
import { theme as uiTheme } from '../constants/theme';
import { useColorScheme } from '../components/useColorScheme';
import Colors from '../constants/Colors';

// Local color constants for specific transport branding
const getTransportBranding = (type: string, isDark: boolean) => {
  const base = {
    CABLE_AEREO: isDark ? '#E68A75' : '#9e4127',
    BUS_URBANO: isDark ? '#4DB87A' : '#006a37',
    BUSETA: isDark ? '#9E8975' : '#705740',
  };
  return base[type as keyof typeof base] || (isDark ? '#4DB87A' : '#006a37');
};


export default function PurchaseTicketScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, isDark);

  const { transportId, transportTitle, transportType, baseFare, originStopId, destinationStopId } = useLocalSearchParams();

  const { data: fares = [], isLoading: loadingFare } = useRouteFares((transportId as string) || '');

  const match = fares.find((f: any) => f.originStopId === originStopId && f.destinationStopId === destinationStopId);
  const calculatedFare = match ? match.fareAmount : (Number(baseFare) || 0);


  const getTransportConfig = () => {
    const formattedFare = `$${calculatedFare.toLocaleString()}`;
    const brandingColor = getTransportBranding(transportType as string, isDark);

    switch (transportType) {
      case 'CABLE_AEREO':
        return {
          subtitle: 'Viaja por el cielo de Manizales conectando el centro con Villamaría de forma ecológica.',
          mainTicket: { title: 'Pasaje Único', price: formattedFare, icon: <Train size={32} color={brandingColor} /> },
          options: [
            { title: 'Estudiantil', price: '$1.800', info: 'Con carné vigente', icon: <ArrowRight size={20} color={colors.secondary} /> },
            { title: 'Adulto Mayor', price: '$2.000', info: 'Mayores de 65', icon: <Expand size={20} color={colors.primary} /> }
          ]
        };
      case 'BUS_URBANO':
        return {
          subtitle: 'Servicio de buses por las avenidas principales: Santander, Paralela y Kevin Ángel.',
          mainTicket: { title: 'Pasaje Urbano', price: formattedFare, icon: <Bus size={32} color={brandingColor} /> },
          options: [
            { title: 'Ruta Circular', price: formattedFare, info: 'Todo el día', icon: <ArrowRight size={20} color={colors.secondary} /> },
            { title: 'Transbordo', price: '$500', info: 'Entre rutas urbanas', icon: <Expand size={20} color={brandingColor} /> }
          ]
        };
      case 'BUSETA':
        return {
          subtitle: 'Transporte rápido y flexible que llega a todos los barrios de la ciudad.',
          mainTicket: { title: 'Pasaje Buseta', price: formattedFare, icon: <Bus size={32} color={brandingColor} /> },
          options: [
            { title: 'Colectivo', price: '$2.800', info: 'Servicio expreso', icon: <ArrowRight size={20} color={brandingColor} /> },
            { title: 'Nocturno', price: '$3.000', info: 'Después de las 10 PM', icon: <Expand size={20} color={colors.primary} /> }
          ]
        };
      case 'INTERMUNICIPAL':
      default:
        return {
          subtitle: 'Conexión desde la terminal de transportes hacia municipios cercanos.',
          mainTicket: { title: (transportTitle as string) || 'Pasaje', price: formattedFare, icon: <Bus size={32} color={colors.onSurfaceVariant} /> },
          options: [
            { title: 'Villamaría', price: '$2.500', icon: <ArrowRight size={20} color={colors.secondary} /> },
            { title: 'Chinchiná', price: '$4.500', info: 'Frecuencia 15 min', icon: <Expand size={20} color={brandingColor} /> }
          ]
        };
    }
  };

  const config = getTransportConfig();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
            <Text style={[styles.moduleBadgeText, { color: colors.secondary }]}>MÓDULO DE COMPRA</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Compra Pasaje: {transportTitle || 'SITP'}</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{config.subtitle}</Text>
        </View>


        {/* Route Details (if P2P) */}
        {originStopId && destinationStopId && (
          <View style={[styles.routeDetails, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline + '20' }]}>
            <View style={styles.routeDetailItem}>
              <MapPin size={16} color={colors.primary} />
              <Text style={[styles.routeDetailText, { color: colors.text }]}>Origen seleccionado</Text>
            </View>
            <View style={[styles.routeConnector, { backgroundColor: colors.outline + '40' }]} />
            <View style={styles.routeDetailItem}>
              <MapPin size={16} color={colors.secondary} />
              <Text style={[styles.routeDetailText, { color: colors.text }]}>Destino seleccionado</Text>
            </View>
          </View>
        )}


        {/* Ticket Options Grid */}
        <View style={styles.grid}>
          <TouchableOpacity 
            style={styles.mainCard} 
            activeOpacity={0.9} 
            disabled={loadingFare}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                {config.mainTicket.icon}
              </View>
              <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{config.mainTicket.title}</Text>
              {loadingFare ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
              ) : (
                <View style={styles.priceContainer}>
                  <Text style={[styles.priceValue, { color: colors.primary }]}>{config.mainTicket.price}</Text>
                  <Text style={[styles.priceCurrency, { color: colors.onSurfaceVariant }]}>COP</Text>
                </View>
              )}
            </View>
            <View style={styles.buyNow}>
              <Text style={[styles.buyNowText, { color: colors.primary }]}>Comprar ahora</Text>
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
                  { backgroundColor: colors.surfaceVariant },
                  index === 1 && { backgroundColor: colors.secondary + '10', borderColor: colors.secondary + '30', borderWidth: 1 }
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.smallCardIcon}>
                  {option.icon}
                </View>
                <Text style={[styles.smallCardTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.smallCardPrice, { color: colors.secondary }]}>{option.price}</Text>
                {option.info && <Text style={[styles.smallCardInfo, { color: colors.onSurfaceVariant }]}>{option.info}</Text>}
              </TouchableOpacity>
            ))}

          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Método de Pago</Text>
          <View style={[styles.paymentCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline + '20' }]}>
            <View style={styles.paymentInfo}>
              <View style={styles.cardVisual}>
                <View style={styles.cardGradient}>
                  <Text style={styles.cardBrand}>VISA</Text>
                </View>
              </View>
              <View>
                <Text style={[styles.paymentName, { color: colors.text }]}>Tu Llave Plus</Text>
                <Text style={[styles.paymentDetail, { color: colors.onSurfaceVariant }]}>Termina en •••• 4291</Text>
              </View>
            </View>
            <Expand size={20} color={colors.onSurfaceVariant} />
          </View>
        </View>


        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.secondary + '15' }]}>
          <Info size={20} color={colors.secondary} />
          <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
            Recuerda que tienes hasta 110 minutos para realizar trasbordos entre buses zonales y troncales sin costo adicional o con un valor mínimo.
          </Text>
        </View>


        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    height: 72,
    backgroundColor: isDark ? colors.surface : '#064E3B',
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    letterSpacing: 1.2,
    color: colors.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  routeDetails: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outlineVariant,
  },
  routeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDetailText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  routeConnector: {
    width: 2,
    height: 12,
    marginLeft: 7,
    marginVertical: 4,
    backgroundColor: colors.outlineVariant,
  },
  grid: {
    gap: 16,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
  },
  popularBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: colors.primary,
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
    color: colors.text,
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
    fontWeight: '700',
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
    backgroundColor: colors.surfaceVariant,
  },
  smallCardIcon: {
    marginBottom: 12,
  },
  smallCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  smallCardPrice: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
    color: colors.secondary,
  },
  smallCardInfo: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  paymentSection: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outlineVariant,
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
    color: colors.text,
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
    borderRadius: 16,
    backgroundColor: colors.secondary + '15',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
});
