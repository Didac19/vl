import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MapPin, Search, Wallet as WalletIcon, QrCode, ArrowRight, Train, Bus, Map as MapIcon } from 'lucide-react-native';
import { theme } from '../../constants/theme';

export default function DashboardScreen() {
  const balance = "15.400"; // format cents in the future

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header con Perfil */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Buenos días,</Text>
            <Text style={styles.userName}>Juan Carlos 👋</Text>
          </View>
          <TouchableOpacity style={styles.profileCircle}>
            <Text style={styles.profileInitials}>JC</Text>
          </TouchableOpacity>
        </View>

        {/* Card de Billetera */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <WalletIcon color={theme.colors.neutral.white} size={20} />
            <Text style={styles.balanceLabel}>Tu Saldo Vía Libre</Text>
          </View>
          <Text style={styles.balanceAmount}>
            <Text style={styles.currencySymbol}>$</Text>
            {balance}
          </Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceBtn}>
              <Text style={styles.balanceBtnText}>Recargar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.balanceBtn, styles.balanceBtnSecondary]}>
              <Text style={[styles.balanceBtnText, styles.balanceBtnTextSecondary]}>Historial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Escaneo QR flotante/destacado */}
        <TouchableOpacity style={styles.qrFab}>
          <QrCode color={theme.colors.neutral.white} size={28} strokeWidth={2.5} />
          <Text style={styles.qrFabText}>Pasaje Activo (2)</Text>
        </TouchableOpacity>

        {/* Búsqueda de Rutas */}
        <Text style={styles.sectionTitle}>Mi Próximo Destino</Text>
        <TouchableOpacity style={styles.searchBar}>
          <Search color={theme.colors.neutral[500]} size={20} />
          <Text style={styles.searchText}>¿A dónde vas ahora?</Text>
        </TouchableOpacity>

        {/* Estaciones Cercanas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estaciones Cercanas</Text>
          <TouchableOpacity>
            <Text style={styles.viewMore}>Ver mapa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stationsList}>
          {nearbyStations.map((station, i) => (
            <TouchableOpacity key={i} style={styles.stationCard}>
              <View style={[styles.typeBadge, { backgroundColor: station.color }]}>
                {station.type === 'TM' ? <Train size={14} color="white" /> : <Bus size={14} color="white" />}
                <Text style={styles.typeBadgeText}>{station.type}</Text>
              </View>
              <View style={styles.stationInfo}>
                <Text style={styles.stationName}>{station.name}</Text>
                <View style={styles.stationMeta}>
                  <MapPin size={12} color={theme.colors.neutral[500]} />
                  <Text style={styles.stationDist}>{station.dist}</Text>
                </View>
              </View>
              <ArrowRight size={18} color={theme.colors.neutral[300]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const nearbyStations = [
  { name: 'Estación Calle 85', dist: '250m - 3 min a pie', type: 'TM', color: theme.colors.transport.transmilenio },
  { name: 'Usaquén - Cll 116', dist: '480m - 7 min a pie', type: 'SITP', color: theme.colors.transport.sitp },
  { name: 'Chico Norte - Ak 15', dist: '620m - 9 min a pie', type: 'SITP', color: theme.colors.transport.sitp },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
    marginTop: theme.spacing[2],
  },
  greeting: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily.sans,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
    fontFamily: theme.typography.fontFamily.sans,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.secondary.terracota,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary.esmeralda,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    ...theme.shadows.esmeralda,
    marginBottom: theme.spacing[6],
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.9,
    marginBottom: theme.spacing[2],
  },
  balanceLabel: {
    color: 'white',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: theme.typography.fontWeight.medium,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[4],
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '400',
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceBtn: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  balanceBtnText: {
    color: theme.colors.primary.esmeralda,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 14,
  },
  balanceBtnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  balanceBtnTextSecondary: {
    color: 'white',
  },
  qrFab: {
    backgroundColor: theme.colors.neutral[900],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.full,
    gap: 12,
    marginBottom: theme.spacing[6],
    ...theme.shadows.md,
  },
  qrFabText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[3],
  },
  viewMore: {
    color: theme.colors.primary.esmeralda,
    fontWeight: '600',
    fontSize: 14,
  },
  searchBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    gap: 12,
    marginBottom: theme.spacing[6],
  },
  searchText: {
    color: theme.colors.neutral[500],
    fontSize: 15,
  },
  stationsList: {
    gap: 12,
  },
  stationCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 1,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
  },
  stationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stationDist: {
    fontSize: 12,
    color: theme.colors.neutral[500],
  },
});
