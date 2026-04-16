import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, ChevronRight, Plus } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMyWallet } from '@/lib/queries';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function WalletScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors);

  const { data: wallet, isLoading: isLoadingWallet } = useMyWallet();
  const walletBalance = wallet?.balance ? wallet.balance / 100 : 0;
  const recentTx = wallet?.transactions || transactions;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Saldo Disponible</Text>
            <Text style={styles.balanceAmount}>${walletBalance.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/top-up')}
            style={styles.topUpButton}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={styles.topUpButtonText}>Recargar</Text>
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
                <QrCode size={48} color={colors.outline} />
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
                <Clock size={12} color={colors.onSurfaceVariant} />
                <Text style={styles.ticketExpires}>Expira en {item.expires}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.outline} />
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.subtitle}>Actividad Reciente</Text>
              <TouchableOpacity><Text style={styles.viewMore}>Filtrar</Text></TouchableOpacity>
            </View>
            {recentTx.length === 0 && (
              <Text style={styles.emptyText}>No hay actividad reciente</Text>
            )}
            {recentTx.map((tx: any, i: number) => {
              const amount = tx.amount ? (tx.type === 'CREDIT' ? tx.amount / 100 : -tx.amount / 100) : tx.amount;
              return (
              <View key={tx.id || i} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: amount > 0 ? colors.success + '20' : colors.error + '20' }]}>
                  {amount > 0 ? (
                    <ArrowDownLeft size={16} color={colors.success} />
                  ) : (
                    <ArrowUpRight size={16} color={colors.error} />
                  )}
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txDate}>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: amount > 0 ? colors.success : colors.text }]}>
                  {amount > 0 ? `+$${amount.toLocaleString()}` : `-$${Math.abs(amount).toLocaleString()}`}
                </Text>
              </View>
            )})}
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

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    fontFamily: theme.typography.fontFamily.sans,
  },
  balanceCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  topUpButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
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
    color: colors.text,
    marginBottom: theme.spacing[4],
  },
  viewMore: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outline,
  },
  emptyText: {
    marginTop: 12,
    color: colors.onSurfaceVariant,
    fontSize: 15,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
    color: colors.text,
    marginBottom: 4,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketExpires: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
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
    color: colors.text,
    marginBottom: 2,
  },
  txDate: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
