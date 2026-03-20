import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Info, Clock, MapPin, ArrowRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const colors = {
  background: "#fcf9f5",
  primary: "#006a37",
  onPrimary: "#ffffff",
  secondary: "#9e4127",
  onSurface: "#1c1c1a",
  onSurfaceVariant: "#3e4a3f",
  surfaceContainerLowest: "#ffffff",
  outline: "#6e7a6e",
};

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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

const styles = StyleSheet.create({
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
    fontWeight: '700',
    color: colors.onSurface,
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 24,
  },
  ticketMainCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 40,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 32,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeBadge: {
    backgroundColor: 'rgba(0, 106, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  activeBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  expiryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  routeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 32,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    width: width * 0.6,
    height: width * 0.6,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  routeDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 32,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pointLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 2,
  },
  pointValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 5,
    marginVertical: 4,
  },
  infoSection: {
    gap: 20,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  helpButton: {
    alignItems: 'center',
    padding: 16,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
