import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bus, BarChart2, ChevronRight, Receipt } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCompanyBusQrs } from '../../lib/queries';
import { theme } from '../../constants/theme';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';

export default function SelectQrRecaudosScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const shadows = theme.shadows[colorScheme];

  const { data: savedQrs, isLoading } = useCompanyBusQrs();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.surface }, shadows.sm]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Recaudos por Bus</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Selecciona un Bus</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Selecciona un código QR existente para ver su historial de recaudos y pagos escaneados.
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
          ) : !savedQrs || savedQrs.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.outline }]}>
              <Receipt size={48} color={colors.outline} />
              <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No hay QRs generados</Text>
              <Text style={[styles.emptySubtext, { color: colors.outline }]}>
                Aún no has generado códigos QR para tus buses.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {savedQrs.map((qr: any) => (
                <TouchableOpacity
                  key={qr.id}
                  style={[styles.qrItem, { borderColor: colors.outlineVariant }]}
                  onPress={() => router.push({ pathname: '/admin/qr-payments', params: { busQrId: qr.id } })}
                >
                  <View style={[styles.iconBg, { backgroundColor: colors.primaryContainer }]}>
                    <Bus size={20} color={colors.onPrimaryContainer} />
                  </View>
                  <View style={styles.qrInfo}>
                    <Text style={[styles.busId, { color: colors.text }]} numberOfLines={1}>{qr.busId}</Text>
                    <Text style={[styles.route, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                      {qr.routeName} · ${Number(qr.amount).toLocaleString(undefined)}
                    </Text>
                  </View>
                  <View style={[styles.statsIcon, { backgroundColor: colors.secondaryContainer }]}>
                    <BarChart2 size={16} color={colors.onSecondaryContainer} />
                  </View>
                  <ChevronRight size={20} color={colors.outline} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, height: 72,
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 24, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  list: { gap: 12 },
  qrItem: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 16, borderRadius: 16, borderWidth: 1 
  },
  iconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qrInfo: { flex: 1, marginLeft: 16 },
  busId: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  route: { fontSize: 13, fontWeight: '500' },
  statsIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 48, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', gap: 12, marginTop: 16 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySubtext: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
});
