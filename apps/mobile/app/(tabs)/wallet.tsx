import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, ChevronRight, Plus } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WalletScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.title}>Mis Pasajes</Text>
          <TouchableOpacity
            onPress={() => router.push('/select-transport')}
            style={{
              backgroundColor: theme.colors.primary.esmeralda,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Plus size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Nuevo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeTickets}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Tiquetes Activos</Text>
            {activeTickets.length === 0 && (
              <View style={styles.emptyState}>
                <QrCode size={48} color={theme.colors.neutral[300]} />
                <Text style={styles.emptyText}>No tienes pasajes activos</Text>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.ticketCard}>
            <View style={[styles.ticketBadge, { backgroundColor: item.color }]}>
              <QrCode size={20} color="white" />
            </View>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketRoute}>{item.route}</Text>
              <View style={styles.ticketMeta}>
                <Clock size={12} color={theme.colors.neutral[500]} />
                <Text style={styles.ticketExpires}>Expira en {item.expires}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.colors.neutral[300]} />
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.subtitle}>Actividad Reciente</Text>
              <TouchableOpacity><Text style={styles.viewMore}>Filtrar</Text></TouchableOpacity>
            </View>
            {transactions.map((tx, i) => (
              <View key={i} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.amount > 0 ? theme.colors.semantic.successLight : theme.colors.semantic.errorLight }]}>
                  {tx.amount > 0 ? (
                    <ArrowDownLeft size={16} color={theme.colors.semantic.success} />
                  ) : (
                    <ArrowUpRight size={16} color={theme.colors.semantic.error} />
                  )}
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.amount > 0 ? theme.colors.semantic.success : theme.colors.neutral[900] }]}>
                  {tx.amount > 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                </Text>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={{ padding: theme.spacing[4] }}
      />
    </SafeAreaView>
  );
}

const activeTickets = [
  { id: '1', route: 'TransMilenio - B01 Portal Norte', expires: '2h 15min', color: theme.colors.transport.transmilenio },
  { id: '2', route: 'SITP - 302 Usaquén', expires: '45min', color: theme.colors.transport.sitp },
];

const transactions = [
  { description: 'Pasaje TransMilenio B01', date: 'Hoy, 08:32 AM', amount: -2950 },
  { description: 'Recarga PSE - Bancolombia', date: 'Ayer, 04:15 PM', amount: 20000 },
  { description: 'Pasaje SITP 302', date: 'Ayer, 07:45 AM', amount: -2950 },
  { description: 'Pasaje Cooperativa Medellín', date: '12 May, 06:10 PM', amount: -12000 },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.neutral[900],
    fontFamily: theme.typography.fontFamily.sans,
  },
  section: {
    marginBottom: theme.spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing[4],
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[4],
  },
  viewMore: {
    color: theme.colors.primary.esmeralda,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.neutral[200],
  },
  emptyText: {
    marginTop: 12,
    color: theme.colors.neutral[500],
    fontSize: 15,
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
    ...theme.shadows.sm,
  },
  ticketBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketRoute: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketExpires: {
    fontSize: 12,
    color: theme.colors.neutral[600],
    fontWeight: '500',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[50],
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  txDate: {
    fontSize: 12,
    color: theme.colors.neutral[500],
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
