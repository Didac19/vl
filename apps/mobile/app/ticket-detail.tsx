import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Info, Clock, MapPin, ArrowRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Removed hardcoded colors object

export default function TicketDetailScreen() {
  const router = useRouter();
  const { ticketId, routeName, expiryTime } = useLocalSearchParams();

  // Mock data for fallback
  const ticketData = {
    route: routeName || "Cable Aéreo - Línea Cámbulos",
    expiry: expiryTime || "Vence en 45m",
    origin: "Terminal",
    destination: "Fundadores",
    qrUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOykCGLg5T_umC1bunDeEkIvu7me9EhNqexqzo6QpmJLKfGr9jKb8C7OwwuRBwamMhykdHReDjOa-fICs8SL3nfZ64bVZmc27HzMYxPlIPlxM5zYGHeXVIPw4uDcCqNe3h6vO-pb2aETAmk4Tsl3BmWlsHDd2RsMXrFmE81lKbMD5bLh0rx1UUprbZI0G6ZgD1MKPdFpuX56M6z0g6LRrst_vhj71U4ZK42lseVXZmKAm63sgJ0VLE50PWJ3S5o26wKE6uH3jIAE9x'
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pasaje</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Share2 size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ticket Card Main */}
        <View style={styles.ticketMainCard}>
          <View style={styles.ticketHeader}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>TICKET ACTIVO</Text>
            </View>
            <Text style={styles.expiryText}>{ticketData.expiry}</Text>
          </View>

          <Text style={styles.routeTitle}>{ticketData.route}</Text>

          {/* Expanded QR Area */}
          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <Image
                source={{ uri: ticketData.qrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.qrInstructions}>
              Ubique este código frente al lector del torniquete para ingresar al sistema.
            </Text>
          </View>

          {/* Route Info */}
          <View style={styles.routeDetails}>
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View>
                <Text style={styles.pointLabel}>ORIGEN</Text>
                <Text style={styles.pointValue}>{ticketData.origin}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
              <View>
                <Text style={styles.pointLabel}>DESTINO</Text>
                <Text style={styles.pointValue}>{ticketData.destination}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Info Items */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Clock size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.infoText}>Válido por 110 minutos para trasbordos</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.infoText}>Uso personal e intransferible</Text>
          </View>
          <View style={styles.infoItem}>
            <Info size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.infoText}>Conserve su código hasta finalizar el viaje</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => { }}
        >
          <Text style={styles.helpButtonText}>¿Problemas con el QR?</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 24,
  },
  ticketMainCard: {
    backgroundColor: colors.surface,
    borderRadius: 40,
    padding: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      }
    }),
    marginBottom: 32,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.outlineVariant,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  activeBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  activeBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  expiryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
  routeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    width: width * 0.65,
    height: width * 0.65,
    padding: 24,
    backgroundColor: isDark ? '#F1F5F1' : colors.surfaceContainerLowest,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  routeDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: 32,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pointLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pointValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  routeLine: {
    width: 2.5,
    height: 28,
    backgroundColor: colors.outlineVariant,
    marginLeft: 6,
    marginVertical: 4,
  },
  infoSection: {
    gap: 20,
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  helpButton: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
