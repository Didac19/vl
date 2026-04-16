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
import { Calendar, Filter, X, Check } from 'lucide-react-native';
import { Modal, Platform } from 'react-native';

export default function QrPaymentsScreen() {
  const router = useRouter();
  const { busQrId } = useLocalSearchParams<{ busQrId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const shadows = theme.shadows[colorScheme];

  const [activeFilter, setActiveFilter] = React.useState<'month' | 'all' | 'custom'>('month');
  const [dateRange, setDateRange] = React.useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [pickerMode, setPickerMode] = React.useState<'start' | 'end' | null>(null);

  const queryParams = React.useMemo(() => {
    const base = { page: 1, limit: 100 };
    if (activeFilter === 'all') {
      // Overriding default month by sending a filter that matches everything
      return { 
        ...base, 
        filter: { boardedAt: { gte: '1970-01-01' } }
      };
    }
    if (activeFilter === 'custom') {
      // Create local date objects for start and end of the day
      const startIso = new Date(`${dateRange.start}T00:00:00`).toISOString();
      const endIso = new Date(`${dateRange.end}T23:59:59`).toISOString();
      return { 
        ...base, 
        filter: { boardedAt: { bet: [startIso, endIso] } }
      };
    }
    // Backend defaults to current month
    return base;
  }, [activeFilter, dateRange]);

  const { data, isLoading, isError } = useQrPayments(busQrId, queryParams);

  const totalCOP = data ? data.totalCollectedCents / 100 : 0;
  const logs = data?.data || [];
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
                <Text style={styles.fareText}>${Number(busQr?.amount || 0).toLocaleString(undefined)} / pasaje</Text>}
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
                    {data?.total || 0} {data?.total === 1 ? 'pago' : 'pagos'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filters */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={[
                  styles.filterIcon, 
                  { backgroundColor: activeFilter === 'custom' ? colors.primary : colors.surfaceVariant }
                ]}
                onPress={() => setActiveFilter(activeFilter === 'custom' ? 'month' : 'custom')}
              >
                <Filter size={16} color={activeFilter === 'custom' ? 'white' : colors.onSurfaceVariant} />
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <FilterChip 
                  label="Este Mes" 
                  active={activeFilter === 'month'} 
                  onPress={() => setActiveFilter('month')} 
                  colors={colors}
                />
                <FilterChip 
                  label="Histórico Total" 
                  active={activeFilter === 'all'} 
                  onPress={() => setActiveFilter('all')} 
                  colors={colors}
                />
              </ScrollView>
            </View>

            {activeFilter === 'custom' && (
              <View style={[styles.customDateContainer, { backgroundColor: colors.surfaceVariant }]}>
                <View style={styles.dateInputGroup}>
                  <Text style={[styles.dateLabel, { color: colors.onSurfaceVariant }]}>Desde:</Text>
                  <TouchableOpacity 
                    style={[styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.outline }]}
                    onPress={() => setPickerMode('start')}
                  >
                    <Text style={{ color: colors.text }}>{dateRange.start}</Text>
                    <Calendar size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.dateInputGroup}>
                  <Text style={[styles.dateLabel, { color: colors.onSurfaceVariant }]}>Hasta:</Text>
                  <TouchableOpacity 
                    style={[styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.outline }]}
                    onPress={() => setPickerMode('end')}
                  >
                    <Text style={{ color: colors.text }}>{dateRange.end}</Text>
                    <Calendar size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <DatePickerModal
              visible={pickerMode !== null}
              initialDate={pickerMode === 'start' ? dateRange.start : dateRange.end}
              title={pickerMode === 'start' ? 'Fecha Inicial' : 'Fecha Final'}
              onClose={() => setPickerMode(null)}
              onSelect={(date) => {
                if (pickerMode === 'start') {
                  setDateRange({ ...dateRange, start: date });
                } else {
                  setDateRange({ ...dateRange, end: date });
                }
                setPickerMode(null);
              }}
              colors={colors}
              shadows={shadows}
            />

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
                      key={`payment-${i}-${log.id || 'no-id'}`}
                      style={[
                        styles.logRow,
                        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
                      ]}
                    >
                      <View style={[styles.logIcon, { backgroundColor: colors.primaryContainer }]}>
                        <Receipt size={16} color={colors.onPrimaryContainer} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.logDesc, { color: colors.text }]}>
                            {log.quantity > 1 ? `Compra x${log.quantity}` : 'Pasaje individual'}
                          </Text>
                          {log.routeId && (
                            <View style={[styles.inlineBadge, { backgroundColor: colors.surfaceVariant }]}>
                              <Text style={[styles.inlineBadgeText, { color: colors.onSurfaceVariant }]}>
                                {log.routeId.split('-')[0].toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.logIdLabel, { color: colors.outline }]}>Bus:</Text>
                          <Text style={[styles.logTripId, { color: colors.onSurfaceVariant }]}>
                            {log.tripId || '—'}
                          </Text>
                        </View>
                        <Text style={[styles.logId, { color: colors.outline }]}>
                          Ref: {log.id.split('-')[0]}...{log.id.split('-').pop()}
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

function FilterChip({ label, active, onPress, colors }: { label: string, active: boolean, onPress: () => void, colors: any }) {
  return (
    <TouchableOpacity 
      style={[
        styles.chip, 
        { backgroundColor: active ? colors.primary : colors.surfaceVariant },
        active && styles.chipActive
      ]} 
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: active ? 'white' : colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DatePickerModal({ visible, initialDate, title, onClose, onSelect, colors, shadows }: any) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  React.useEffect(() => {
    // When opening, default the calendar view to the current month to show Today
    if (visible) {
      setCurrentDate(new Date());
    }
  }, [visible]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const formatDateString = (day: number) => {
    const d = new Date(Date.UTC(year, month, day));
    return d.toISOString().split('T')[0];
  };

  const selectedDay = new Date(initialDate).getFullYear() === year && 
                      new Date(initialDate).getMonth() === month ? 
                      new Date(initialDate).getDate() : null;

  const today = new Date();
  const currentDay = today.getFullYear() === year && 
                     today.getMonth() === month ? 
                     today.getDate() : null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerContent, { backgroundColor: colors.surface }, shadows.lg]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <X size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: colors.text }]}>
              {monthNames[month]} {year}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={[styles.navButton, { transform: [{ rotate: '180deg' }] }]}>
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
              <Text key={`${d}-${i}`} style={[styles.dayHeader, { color: colors.outline }]}>{d}</Text>
            ))}
            {days.map((day, i) => (
              <TouchableOpacity
                key={i}
                disabled={day === null}
                onPress={() => day && onSelect(formatDateString(day))}
                style={[
                  styles.dayCell,
                  day === selectedDay && { backgroundColor: colors.primary },
                  day === currentDay && day !== selectedDay && { borderColor: colors.primary, borderWidth: 1 }
                ]}
              >
                <Text style={[
                  styles.dayText,
                  { color: day === null ? 'transparent' : day === selectedDay ? 'white' : colors.text }
                ]}>
                  {day}
                </Text>
                {day === currentDay && (
                  <View style={[
                    styles.todayIndicator, 
                    { backgroundColor: day === selectedDay ? 'white' : colors.primary }
                  ]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
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
  logDesc: { fontSize: 14, fontWeight: '700' },
  logIdLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  logTripId: { fontSize: 12, fontWeight: '800' },
  logId: { fontSize: 10, fontWeight: '500', marginBottom: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  logDate: { fontSize: 11 },
  logAmount: { fontSize: 15, fontWeight: '800' },
  inlineBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  inlineBadgeText: { fontSize: 10, fontWeight: '800' },
  filterSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  filterIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { gap: 8 },
  chip: { 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
    borderWidth: 1, borderColor: 'transparent' 
  },
  chipActive: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 },
  chipText: { fontSize: 13, fontWeight: '700' },
  customDateContainer: {
    padding: 16, borderRadius: 20, marginBottom: 20, flexDirection: 'row', gap: 12
  },
  dateInputGroup: { flex: 1, gap: 4 },
  dateLabel: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  dateInput: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1
  },
  emptyState: {
    alignItems: 'center', paddingVertical: 48,
    borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', gap: 10,
  },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySubtext: { fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  
  // Picker Modal Styles
  modalOverlay: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', alignItems: 'center', padding: 20 
  },
  pickerContent: { width: '100%', borderRadius: 24, padding: 20 },
  pickerHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 
  },
  pickerTitle: { fontSize: 18, fontWeight: '800' },
  closeIcon: { padding: 4 },
  monthSelector: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 
  },
  navButton: { padding: 4 },
  monthText: { fontSize: 16, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayHeader: { width: '14.28%', textAlign: 'center', fontWeight: '700', fontSize: 12, marginBottom: 10 },
  dayCell: { 
    width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 
  },
  dayText: { fontSize: 14, fontWeight: '600' },
  todayIndicator: {
    width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 4
  },
});
