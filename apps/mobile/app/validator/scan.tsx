import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info, RefreshCw, CheckCircle2, XCircle, LogOut, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@transix/shared-types';

export default function ScanTicketScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isKioskMode = user?.role === UserRole.VALIDATOR;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    let timer: any;
    if (scanResult) {
      timer = setTimeout(() => {
        resetScanner();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [scanResult]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: colors.text }]}>Necesitamos permiso para usar la cámara</Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={requestPermission}
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Conceder Permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      console.log('Scanned QR:', data);
      
      const response = await api.post('/tickets/scan', { qrToken: data });
      const result = response.data;
      
      setScanResult({
        success: result.success,
        message: result.message
      });
    } catch (e: any) {
      setScanResult({
        success: false,
        message: e.response?.data?.message || 'Error al validar el pasaje'
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirmar Salida",
      "¿Desea cerrar sesión en el modo validador?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          } 
        }
      ]
    );
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        {isKioskMode ? (
          <TouchableOpacity onPress={handleLogout} style={styles.headerIconButton}>
            <LogOut size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Validador de Pasajes</Text>
        <View style={styles.validatorBadge}>
          <User size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.validatorName} numberOfLines={1}>
            {user?.fullName?.split(' ')[0] || 'Personal'}
          </Text>
        </View>
      </View>

      <View style={styles.cameraContainer}>
        {!scanResult ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.focusedRow}>
                <View style={styles.unfocusedContainer}></View>
                <View style={[styles.focusedContainer, { borderColor: scanned ? colors.primary : '#FFFFFF' }]} />
                <View style={styles.unfocusedContainer}></View>
              </View>
              <View style={styles.unfocusedContainer}>
                <Text style={styles.instructionText}>
                  Ubique el código QR dentro del recuadro
                </Text>
              </View>
            </View>
          </CameraView>
        ) : (
          <View style={[styles.resultContainer, { backgroundColor: colors.surface }]}>
            {scanResult.success ? (
              <CheckCircle2 size={80} color={theme.colors.semantic.success} />
            ) : (
              <XCircle size={80} color={theme.colors.semantic.error} />
            )}
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              {scanResult.success ? '¡Éxito!' : 'Denegado'}
            </Text>
            <Text style={[styles.resultMessage, { color: colors.onSurfaceVariant }]}>
              {scanResult.message}
            </Text>
            {/* Optional manual action buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.resetButton, { backgroundColor: colors.primary }]} 
                onPress={resetScanner}
              >
                <RefreshCw size={20} color={colors.onPrimary} />
                <Text style={[styles.resetButtonText, { color: colors.onPrimary }]}>Siguiente (3s)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.closeButton, { borderColor: colors.outline }]} 
                onPress={isKioskMode ? resetScanner : () => router.back()}
              >
                <Text style={[styles.closeButtonText, { color: colors.onSurfaceVariant }]}>
                  {isKioskMode ? 'Cerrar' : 'Finalizar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <View style={styles.infoRow}>
          <Info size={20} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
            El sistema verifica la firma digital del pasaje para asegurar su autenticidad.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  validatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    maxWidth: 100,
  },
  validatorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  unfocusedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedRow: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
