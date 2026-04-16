import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, QrCode, Bus, DollarSign, Plus, Check, RefreshCw, ChevronRight, BarChart2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useTransportRoutes, useGenerateBusQr, useCompanyBusQrs } from '../../lib/queries';
import { useAuthStore } from '../../store/auth';
import { UserRole, RouteDto } from '@transix/shared-types';
import { theme } from '../../constants/theme';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';

export default function GenerateBusQrScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const shadows = theme.shadows[colorScheme];

  // Form State
  const [busId, setBusId] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [isNewRoute, setIsNewRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');

  // Which saved QR is selected (for regenerate flow)
  const [selectedBusQrId, setSelectedBusQrId] = useState<string | null>(null);

  // Result State
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const qrCardRef = React.useRef<View>(null);

  const { data: transportTypes, isLoading: loadingRoutes } = useTransportRoutes(
    user?.role === UserRole.COMPANY_ADMIN ? { companyId: (user as any).companyId } : {}
  );
  const { data: savedQrs, isLoading: loadingQrs } = useCompanyBusQrs();
  const generateQr = useGenerateBusQr();

  const allRoutes: RouteDto[] = transportTypes ? transportTypes.flatMap(t => t.routes) : [];

  const handleSelectSavedQr = (qr: any) => {
    setSelectedBusQrId(qr.id);
    setBusId(qr.busId);
    setAmount(String(qr.amount));
    setSelectedRouteId(qr.route?.id || '');
    setIsNewRoute(false);
    setGeneratedToken(qr.token); // Show the existing token immediately
  };

  const handleClearSelection = () => {
    setSelectedBusQrId(null);
    setBusId('');
    setAmount('');
    setSelectedRouteId('');
    setGeneratedToken(null);
  };

  const handleGenerate = async () => {
    if (!busId) { Alert.alert('Error', 'Por favor ingresa la identificación del bus'); return; }
    if (!isNewRoute && !selectedRouteId) { Alert.alert('Error', 'Por favor selecciona una ruta'); return; }
    if (isNewRoute && (!newRouteName || !selectedTypeId)) { Alert.alert('Error', 'Por favor completa los datos de la nueva ruta'); return; }
    if (!amount || isNaN(Number(amount))) { Alert.alert('Error', 'Por favor ingresa un monto válido'); return; }

    try {
      setLoading(true);
      const payload: any = { busId, amount: Number(amount) };
      if (isNewRoute) {
        payload.newRoute = { name: newRouteName, transportTypeId: selectedTypeId, baseFare: Number(amount) };
      } else {
        payload.routeId = selectedRouteId;
      }
      const result = await generateQr.mutateAsync(payload);
      setGeneratedToken(result.token);
      setSelectedBusQrId(result.busQrId);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo generar el código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const uri = await captureRef(qrCardRef, { format: 'png', quality: 0.9 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
      }
    } catch {
      Alert.alert('Error', 'No se pudo capturar la imagen para compartir');
    }
  };

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso denegado', 'Necesitamos permiso para guardar la imagen en tu galería'); return; }
      const uri = await captureRef(qrCardRef, { format: 'png', quality: 0.9 });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('TranSix-QRs', asset, false);
      Alert.alert('Éxito', 'QR guardado en tu galería');
    } catch {
      Alert.alert('Error', 'No se pudo guardar la imagen');
    }
  };

  const isRegenerate = !!selectedBusQrId && !!generatedToken;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.surface }, shadows.sm]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>QRs de Bus</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Saved QRs Section */}
        {(savedQrs && savedQrs.length > 0) && (
          <View style={[styles.card, { backgroundColor: colors.surface }, shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>QRs Guardados</Text>
            {loadingQrs ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.savedQrList}>
                {savedQrs.map((qr: any) => (
                  <TouchableOpacity
                    key={qr.id}
                    style={[
                      styles.savedQrItem,
                      { borderColor: selectedBusQrId === qr.id ? colors.primary : colors.outlineVariant },
                      selectedBusQrId === qr.id && { backgroundColor: colors.primary + '10' },
                    ]}
                    onPress={() => handleSelectSavedQr(qr)}
                  >
                    <View style={styles.savedQrLeft}>
                      <View style={[styles.savedQrBadge, { backgroundColor: colors.primaryContainer }]}>
                        <Bus size={18} color={colors.onPrimaryContainer} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.savedQrBusId, { color: colors.text }]} numberOfLines={1}>
                          {qr.busId}
                        </Text>
                        <Text style={[styles.savedQrRoute, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                          {qr.routeName} · ${Number(qr.amount).toLocaleString(undefined)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.savedQrActions}>
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/admin/qr-payments', params: { busQrId: qr.id } })}
                        style={[styles.statsButton, { backgroundColor: colors.secondaryContainer }]}
                      >
                        <BarChart2 size={16} color={colors.onSecondaryContainer} />
                      </TouchableOpacity>
                      {selectedBusQrId === qr.id && <Check size={18} color={colors.primary} style={{ marginLeft: 8 }} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity onPress={handleClearSelection} style={styles.newQrButton}>
              <Plus size={16} color={colors.primary} />
              <Text style={[styles.newQrButtonText, { color: colors.primary }]}>Crear nuevo QR</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Generate / Regenerate Form */}
        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isRegenerate ? `Regenerar QR — ${busId}` : 'Nuevo QR de Bus'}
          </Text>

          {!isRegenerate && (
            <>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Identificación del Bus</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Bus size={20} color={colors.onSurfaceVariant} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Ej: BUS-001, Placa XYZ-123"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={busId}
                  onChangeText={setBusId}
                />
              </View>
              <View style={styles.divider} />
            </>
          )}

          {!isRegenerate && (
            <>
              <View style={styles.row}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>¿Nueva Ruta?</Text>
                <Switch
                  value={isNewRoute}
                  onValueChange={setIsNewRoute}
                  trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary.esmeralda }}
                />
              </View>

              {isNewRoute ? (
                <View style={styles.newRouteForm}>
                  <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Nombre de la Ruta</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Ej: Terminal - Centro"
                      placeholderTextColor={colors.onSurfaceVariant}
                      value={newRouteName}
                      onChangeText={setNewRouteName}
                    />
                  </View>
                  <Text style={[styles.label, { color: colors.onSurfaceVariant, marginTop: 12 }]}>Tipo de Transporte</Text>
                  <View style={styles.typeGrid}>
                    {transportTypes?.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[styles.typeChip, { backgroundColor: selectedTypeId === type.id ? colors.primary : colors.background }, selectedTypeId === type.id && shadows.sm]}
                        onPress={() => setSelectedTypeId(type.id)}
                      >
                        <Text style={[styles.typeChipText, { color: selectedTypeId === type.id ? colors.onPrimary : colors.text }]}>
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.existingRouteForm}>
                  <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Seleccionar Ruta</Text>
                  {loadingRoutes ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <View style={styles.routeGrid}>
                      {allRoutes.map((route) => (
                        <TouchableOpacity
                          key={route.id}
                          style={[styles.routeChip, { borderColor: selectedRouteId === route.id ? colors.primary : colors.outline }, selectedRouteId === route.id && { backgroundColor: colors.primary + '10' }]}
                          onPress={() => { setSelectedRouteId(route.id); setAmount(route.baseFare.toString()); }}
                        >
                          <Text style={[styles.routeChipText, { color: selectedRouteId === route.id ? colors.primary : colors.text }]}>
                            {route.name}
                          </Text>
                          {selectedRouteId === route.id && <Check size={16} color={colors.primary} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.divider} />
            </>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monto del Pasaje</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
            <DollarSign size={20} color={colors.onSurfaceVariant} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Monto en COP"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: isRegenerate ? colors.secondary : colors.primary }]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                {isRegenerate ? <RefreshCw size={20} color="white" /> : <QrCode size={20} color={colors.onPrimary} />}
                <Text style={styles.generateButtonText}>
                  {isRegenerate ? 'Regenerar QR' : 'Generar Código QR'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* QR Display */}
        {generatedToken && (
          <View ref={qrCardRef} style={[styles.qrCard, { backgroundColor: colors.surface }, shadows.sm]}>
            <Text style={[styles.qrTitle, { color: colors.text }]}>
              {isRegenerate ? 'QR Actualizado' : '¡Código QR Generado!'}
            </Text>
            <Text style={[styles.qrSubtitle, { color: colors.onSurfaceVariant }]}>
              {busId} · {isNewRoute ? newRouteName : allRoutes.find(r => r.id === selectedRouteId)?.name || savedQrs?.find((q: any) => q.id === selectedBusQrId)?.routeName}
            </Text>
            <View style={styles.qrContainer}>
              <QRCode value={generatedToken} size={220} color="black" backgroundColor="white" />
            </View>
            <Text style={[styles.qrAmount, { color: colors.primary }]}>
              ${Number(amount).toLocaleString(undefined)}
            </Text>
          </View>
        )}

        {generatedToken && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: colors.primary }]}>Guardar en Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.printButton, { backgroundColor: colors.primary }]} onPress={handleShare}>
              <Text style={[styles.printButtonText, { color: colors.onPrimary }]}>Compartir QR</Text>
            </TouchableOpacity>
          </View>
        )}

        {generatedToken && selectedBusQrId && (
          <TouchableOpacity
            style={[styles.paymentsButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => router.push({ pathname: '/admin/qr-payments', params: { busQrId: selectedBusQrId } })}
          >
            <BarChart2 size={18} color={colors.primary} />
            <Text style={[styles.paymentsButtonText, { color: colors.primary }]}>Ver recaudación de este bus</Text>
            <ChevronRight size={18} color={colors.primary} />
          </TouchableOpacity>
        )}

        {generatedToken && (
          <TouchableOpacity style={styles.resetButton} onPress={handleClearSelection}>
            <Text style={[styles.resetButtonText, { color: colors.onSurfaceVariant }]}>Generar otro</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    height: 72,
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 24, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  divider: { height: 1, backgroundColor: theme.colors.neutral[200], marginVertical: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 56, borderRadius: 16, gap: 12,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  newRouteForm: { marginTop: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  typeChipText: { fontSize: 13, fontWeight: '700' },
  existingRouteForm: { marginTop: 8 },
  routeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  routeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 6 },
  routeChipText: { fontSize: 14, fontWeight: '600' },
  generateButton: { marginTop: 24, height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  generateButtonText: { color: 'white', fontSize: 18, fontWeight: '800' },
  // Saved QRs
  savedQrList: { gap: 10, marginBottom: 12 },
  savedQrItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, borderWidth: 1.5 },
  savedQrLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  savedQrBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  savedQrBusId: { fontSize: 15, fontWeight: '700' },
  savedQrRoute: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  savedQrActions: { flexDirection: 'row', alignItems: 'center' },
  statsButton: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  newQrButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, alignSelf: 'flex-start' },
  newQrButtonText: { fontSize: 14, fontWeight: '700' },
  // QR Card
  qrCard: { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16 },
  qrTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  qrSubtitle: { fontSize: 14, marginBottom: 20 },
  qrContainer: { backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 20 },
  qrAmount: { fontSize: 32, fontWeight: '900' },
  // Actions
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12, width: '100%' },
  saveButton: { flex: 1, height: 56, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 14, fontWeight: '700' },
  printButton: { flex: 1, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  printButtonText: { fontSize: 14, fontWeight: '700', color: 'white' },
  paymentsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, marginBottom: 12 },
  paymentsButtonText: { fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'center' },
  resetButton: { padding: 12, alignSelf: 'center' },
  resetButtonText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
