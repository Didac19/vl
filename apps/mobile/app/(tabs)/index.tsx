import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Search, ArrowRight, Home, Briefcase, Plus, Map as MapIcon, Bus, Train, LocateFixed, Navigation } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/auth';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const userName = user?.fullName?.split(' ')[0] || "Usuario";
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {/* TopAppBar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Text style={[styles.logoText, { color: colors.primary }]}>TranSix</Text>
          </View>
          <TouchableOpacity style={styles.avatarBorder}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7MgQDF5_085DE_SyvHWvZvrrFDzPMBijC_JOHjq2YlKvTWUdUX8I9YorMRtU-S50FUx8Hd5K45Xfi92EtnpkMkj240bkHMhrsc9n7q-GqrevhkRVqzArjmL10_155KcP71w0pM-L7uRNFzZLHlXHSY-h0NePCBe99pg5pwi9UsAbhZTM1SMRzI5CQxcXuCp0_9WsLFIj5jslZet-JJw5cd6COB58nxZ9a0uSF817xxe8w-WX2ADa8XNuu-0fPvD0MsgPyTKr_UnYH' }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.surfaceContainerHighest }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.welcomeTitle}>¡Hola, {userName}!</Text>
          <Text style={styles.welcomeSubtitle}>Gestione su movilidad activa</Text>
        </View>

        {/* Active Ticket Section (NEW) */}
        <View style={styles.activeTicketContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push({
              pathname: '/ticket-detail',
              params: { routeName: 'Cable Aéreo - Línea Cámbulos', expiryTime: 'Vence en 45m' }
            })}
            style={[styles.activeTicketCard, { backgroundColor: colors.primary }]}
          >
            {/* Decorative shapes */}
            <View style={styles.shapeTop} />
            <View style={styles.shapeBottom} />

            <View style={styles.activeTicketContent}>
              <View style={styles.activeTicketHeader}>
                <View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>TICKET ACTIVO</Text>
                  </View>
                  <Text style={styles.activeRouteTitle}>Línea Cámbulos - Fundadores</Text>
                </View>
                <Text style={styles.expiryText}>Vence en 45m</Text>
              </View>

              {/* QR Code Area */}
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOykCGLg5T_umC1bunDeEkIvu7me9EhNqexqzo6QpmJLKfGr9jKb8C7OwwuRBwamMhykdHReDjOa-fICs8SL3nfZ64bVZmc27HzMYxPlIPlxM5zYGHeXVIPw4uDcCqNe3h6vO-pb2aETAmk4Tsl3BmWlsHDd2RsMXrFmE81lKbMD5bLh0rx1UUprbZI0G6ZgD1MKPdFpuX56M6z0g6LRrst_vhj71U4ZK42lseVXZmKAm63sgJ0VLE50PWJ3S5o26wKE6uH3jIAE9x' }}
                    style={styles.qrImage}
                  />
                  <View style={styles.qrInnerBorder} />
                </View>
              </View>

              {/* Route Path */}
              <View style={styles.routePath}>
                <View>
                  <Text style={styles.pathLabel}>ORIGEN</Text>
                  <Text style={styles.pathValue}>Terminal</Text>
                </View>
                <ArrowRight size={20} color="white" opacity={0.5} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pathLabel}>DESTINO</Text>
                  <Text style={styles.pathValue}>Fundadores</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search size={22} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="¿A dónde vas?"
              placeholderTextColor={colors.outline}
            />
            <TouchableOpacity style={styles.searchButton}>
              <ArrowRight size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Quick View (NEW/UPDATED) */}
        <View style={[styles.balanceQuickCard, { backgroundColor: colors.tertiary }]}>
          <View>
            <Text style={styles.balanceLabelSmall}>Saldo en Billetera</Text>
            <Text style={styles.balanceValueLarge}>$42.500 COP</Text>
          </View>
          <TouchableOpacity style={styles.topUpButton}>
            <Text style={styles.topUpButtonText}>Recargar</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Favorites Grid */}
        <View style={styles.bentoGrid}>
          <TouchableOpacity style={[styles.bentoCard, styles.bentoCardLarge]}>
            <View style={styles.bentoCardHeader}>
              <View style={[styles.bentoIconBox, { backgroundColor: colors.primaryContainer }]}>
                <Home size={24} color={colors.onPrimaryContainer} fill={colors.onPrimaryContainer} />
              </View>
              <Text style={styles.bentoTag}>FAVORITO</Text>
            </View>
            <View>
              <Text style={styles.bentoTitle}>Casa</Text>
              <Text style={styles.bentoSubtitle}>Av. Santander #54-21</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bentoColumn}>
            <TouchableOpacity style={[styles.bentoCard, styles.bentoCardSmall]}>
              <View style={[styles.bentoIconBox, { backgroundColor: colors.secondaryContainer }]}>
                <Briefcase size={20} color={colors.onSecondaryContainer} fill={colors.onSecondaryContainer} />
              </View>
              <View>
                <Text style={styles.bentoTitleSmall}>Trabajo</Text>
                <Text style={styles.bentoSubtitleSmall}>Centro Int.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.bentoCard, styles.bentoCardSmall, { backgroundColor: colors.tertiaryFixed }]}>
              <View style={[styles.bentoIconBox, { backgroundColor: colors.tertiaryContainer }]}>
                <Plus size={20} color={colors.onTertiaryContainer} />
              </View>
              <View>
                <Text style={[styles.bentoTitleSmall, { color: colors.onTertiaryFixedVariant }]}>Añadir</Text>
                <Text style={[styles.bentoSubtitleSmall, { color: colors.onTertiaryFixedVariant, opacity: 0.7 }]}>Nuevo lugar</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Pasajes (NEW) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pasajes Recientes</Text>
          <TouchableOpacity>
            <Text style={[styles.viewMapText, { color: colors.secondary }]}>Ver todo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentList}>
          {/* Recent Item 1 */}
          <View style={styles.recentItem}>
            <View style={styles.recentLeft}>
              <View style={[styles.recentIconBox, { backgroundColor: colors.primaryContainer }]}>
                <Train size={24} color={colors.onPrimaryContainer} />
              </View>
              <View>
                <Text style={styles.recentTitle}>Cable Aéreo - Fundadores</Text>
                <Text style={styles.recentDate}>Hoy, 10:45 AM</Text>
              </View>
            </View>
            <View style={styles.recentRight}>
              <Text style={styles.recentAmount}>$2.500</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Completado</Text>
              </View>
            </View>
          </View>

          {/* Recent Item 2 */}
          <View style={styles.recentItem}>
            <View style={styles.recentLeft}>
              <View style={[styles.recentIconBox, { backgroundColor: colors.tertiaryFixed }]}>
                <Bus size={24} color={colors.onTertiaryFixedVariant} />
              </View>
              <View>
                <Text style={styles.recentTitle}>Bus Urbano - Ruta 2</Text>
                <Text style={styles.recentDate}>Ayer, 06:20 PM</Text>
              </View>
            </View>
            <View style={styles.recentRight}>
              <Text style={styles.recentAmount}>$2.500</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Completado</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nearby Stations Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estaciones Cercanas</Text>
          <TouchableOpacity style={styles.viewMapButton}>
            <Text style={styles.viewMapText}>Ver mapa</Text>
            <MapIcon size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.stationsList}>
          {/* Station Card 1 */}
          <View style={styles.stationCardLarge}>
            <View style={styles.stationCardTop}>
              <View style={styles.stationInfoRow}>
                <View style={[styles.stationIconBox, { backgroundColor: colors.secondary }]}>
                  <Train size={24} color={colors.onSecondary} />
                </View>
                <View>
                  <Text style={styles.stationNameLarge}>Estación Los Cámbulos</Text>
                  <Text style={styles.stationDistLarge}>A 150m de tu ubicación</Text>
                </View>
              </View>
              <View style={styles.typeBadgeContainer}>
                <Text style={styles.typeBadgeTextLarge}>CBL</Text>
              </View>
            </View>

            <View style={styles.arrivalRows}>
              <View style={[styles.arrivalRow, { borderLeftColor: colors.secondary }]}>
                <View style={styles.arrivalInfo}>
                  <Text style={[styles.routeName, { color: colors.secondary }]}>L1</Text>
                  <Text style={styles.destinationName}>Fundadores</Text>
                </View>
                <View style={styles.arrivalTime}>
                  <Text style={[styles.timeText, { color: colors.secondary }]}>1 min</Text>
                  <Text style={styles.statusText}>LLEGANDO</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Live Map Context Area */}
        {/* <View style={styles.mapCard}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIaO9XwDIy30lZQzWIOVZa0GBQ_XEvOKiyI18AigYPw5_Hteun5eCotWBOOs0S2EWau1Hs92HKKy6b-flScGatSUsvqtcddWJLbZH9uWvFmkZJrat1D0jq3s48DXlMffDypWsqKQChN2w1bAAHzN8qwZdqEwYAWFcHZW9TzT0tSn-yx-fzCo8ds63orVJFSNd3j3l-Onusb1L7c46DyONGcCjy2OOjHedeW1S_8WUWT2Odpo_X2IdQ4XQAVQ7ffJkeAievFzLd55gn' }}
            style={styles.mapBackground}
            imageStyle={{ borderRadius: 24, opacity: 0.8 }}
          >
            <View style={styles.mapOverlay}>
              <View>
                <Text style={styles.mapTag}>TRÁFICO EN VIVO</Text>
                <Text style={styles.mapTitle}>Sector Chapinero</Text>
              </View>
              <View style={styles.mapIconBox}>
                <LocateFixed size={20} color={colors.primary} />
              </View>
            </View>
          </ImageBackground>
        </View> */}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB: Planear Ruta */}
      <TouchableOpacity style={styles.fab}>
        <Navigation size={32} color={colors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
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
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  divider: {
    height: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  activeTicketContainer: {
    marginBottom: 40,
  },
  activeTicketCard: {
    borderRadius: 32,
    padding: 32,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  shapeTop: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shapeBottom: {
    position: 'absolute',
    bottom: -48,
    left: -48,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(158,65,39,0.2)', // secondary/20
  },
  activeTicketContent: {
    zIndex: 10,
    alignItems: 'center',
  },
  activeTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  activeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeRouteTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  expiryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 32,
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    width: '100%',
    height: '100%',
    borderWidth: 4,
    borderColor: 'rgba(0,134,71,0.05)', // primaryContainer/20
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: '80%',
    height: '80%',
    opacity: 0.9,
  },
  qrInnerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderColor: colors.primary,
    borderRadius: 12,
    opacity: 0.2,
  },
  routePath: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pathLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pathValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  searchContainer: {
    marginBottom: 40,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 24,
    paddingVertical: 8,
    paddingLeft: 20,
    paddingRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.onSurface,
    height: 48,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 16,
  },
  balanceQuickCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 32,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceLabelSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    opacity: 0.8,
    marginBottom: 4,
  },
  balanceValueLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  topUpButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  topUpButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  bentoCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 32,
    padding: 24,
  },
  bentoCardLarge: {
    flex: 1.2,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  bentoColumn: {
    flex: 1,
    gap: 16,
  },
  bentoCardSmall: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bentoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bentoIconBox: {
    padding: 10,
    borderRadius: 16,
  },
  bentoTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    opacity: 0.6,
  },
  bentoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4,
  },
  bentoSubtitle: {
    fontSize: 14,
    color: colors.outline,
  },
  bentoTitleSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 2,
  },
  bentoSubtitleSmall: {
    fontSize: 12,
    color: colors.outline,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  recentList: {
    gap: 16,
    marginBottom: 40,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 24,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  recentDate: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(0,106,55,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  stationsList: {
    gap: 16,
    marginBottom: 40,
  },
  stationCardLarge: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(110, 122, 110, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  stationCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stationInfoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  stationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationNameLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  stationDistLarge: {
    fontSize: 14,
    color: colors.outline,
  },
  typeBadgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 99,
  },
  typeBadgeTextLarge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.tertiary,
  },
  arrivalRows: {
    gap: 12,
  },
  arrivalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  arrivalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '900',
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurface,
  },
  arrivalTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.outline,
  },
  mapCard: {
    height: 192,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mapBackground: {
    flex: 1,
  },
  mapOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  mapTag: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
    opacity: 0.8,
    marginBottom: 4,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  mapIconBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
