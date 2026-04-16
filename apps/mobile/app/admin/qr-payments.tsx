import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bus, TrendingUp, Receipt } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useQrPayments } from '../../lib/queries';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { theme } from '../../constants/theme';

export default function QrPaymentsScreen() {
  const router = useRouter();
  const { busQrId } = useLocalSearchParams<{ busQrId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const shadows = theme.shadows[colorScheme];

  const { data, isLoading, isError } = useQrPayments(busQrId);

  const totalCOP = data ? data.totalCollectedCents / 100 : 0;
  const logs = data?.logs || [];
  const busQr = data?.busQr;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }, shadows.sm]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Recaudación</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
        ) : isError ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No se pudo cargar la información</Text>
          </View>
        ) : (
          <>
            {/* Bus Info Card */}
            <View style={[styles.busCard, { backgroundColor: colors.primary }]}>
              <View style={styles.busCardHeader}>
                <View style={styles.busIconBg}>
                  <Bus size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.busIdText}>{busQr?.busId || 'Bus'}</Text>
                  <Text style={styles.routeText}>{busQr?.routeName}</Text>
                </View>
                <Text style={styles.fareText}>${Number(busQr?.amount || 0).toLocaleString(undefined)} / pasaje</Text>
              </View>
            </View>

            {/* Revenue Summary Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }, shadows.sm]}>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryIcon, { backgroundColor: colors.primaryContainer }]}>
                  <TrendingUp size={22} color={colors.onPrimaryContainer} />
                </View>
                <View>
                  <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Total Recaudado</Text>
                  <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                    ${totalCOP.toLocaleString(undefined)}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={[styles.countBadge, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.countText, { color: colors.onPrimaryContainer }]}>
                    {logs.length} {logs.length === 1 ? 'pago' : 'pagos'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payments List */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Historial de Pagos</Text>

            {logs.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                <Receipt size={40} color={colors.outline} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Aún no hay pagos registrados</Text>
                <Text style={[styles.emptySubtext, { color: colors.outline }]}>
                  Los pagos aparecerán aquí cuando los usuarios escaneen este QR
                </Text>
              </View>
            ) : (
              <View style={[styles.logList, { backgroundColor: colors.surface }, shadows.sm]}>
                {logs.map((log: any, i: number) => {
                  const isLast = i === logs.length - 1;
                  const amountCOP = Number(log.amount || 0) / 100;
                  return (
                    <View
                      key={log.id || i}
                      style={[
                        styles.logRow,
                        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
                      ]}
                    >
                      <View style={[styles.logIcon, { backgroundColor: colors.primaryContainer }]}>
                        <Receipt size={16} color={colors.onPrimaryContainer} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.logDesc, { color: colors.text }]}>
                          Pasaje cobrado
                        </Text>
                        <Text style={[styles.logDate, { color: colors.onSurfaceVariant }]}>
                          {log.boardedAt
                            ? new Date(log.boardedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </Text>
                      </View>
                      <Text style={[styles.logAmount, { color: colors.primary }]}>
                        +${amountCOP.toLocaleString(undefined)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
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
  busCard: {
    borderRadius: 24, padding: 20, marginBottom: 16,
  },
  busCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  busIconBg: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
  },
  busIdText: { fontSize: 18, fontWeight: '900', color: 'white' },
  routeText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginTop: 2 },
  fareText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textAlign: 'right' },
  card: { borderRadius: 20, padding: 20, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  summaryAmount: { fontSize: 28, fontWeight: '900' },
  countBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  logList: { borderRadius: 20, overflow: 'hidden', paddingHorizontal: 16 },
  logRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 14,
  },
  logIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logDesc: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  logDate: { fontSize: 12 },
  logAmount: { fontSize: 15, fontWeight: '700' },
  emptyState: {
    alignItems: 'center', paddingVertical: 48,
    borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', gap: 10,
  },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySubtext: { fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
});
