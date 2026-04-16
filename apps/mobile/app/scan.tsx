import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, QrCode, Zap, ZapOff, CheckCircle2, ExternalLink } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { theme } from '@/constants/theme';
import { usePayBusQr, useMyWallet } from './../lib/queries';
import { Bus, User, ShoppingCart, Minus, Plus, Wallet as WalletIcon, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const BANK_APPS = [
  { id: 'nequi', name: 'Nequi', deeplink: 'nequi://', androidPackage: 'com.nequi.MobileApp' },
  { id: 'bancolombia', name: 'Bancolombia', deeplink: 'bancolombia://', androidPackage: 'com.todo1.mobile' },
  { id: 'davivienda', name: 'Davivienda', deeplink: 'davivienda://', androidPackage: 'com.davivienda.mobileapp' },
  { id: 'bbva', name: 'BBVA', deeplink: 'bbva://', androidPackage: 'com.bbva.mobile' },
  
];

export default function ScanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankOptions, setShowBankOptions] = useState(false);
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [busData, setBusData] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);

  const payBusQr = usePayBusQr();
  const { data: wallet } = useMyWallet();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <QrCode size={64} color={colors.primary} style={{ marginBottom: 24 }} />
        <Text style={styles.permissionText}>Necesitamos acceso a tu cámara para escanear el código QR</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    
    console.log('Scanned QR:', data);

    try {
      if (data.startsWith('/')) {
        router.push(data as any);
        return;
      }

      const isURL = data.startsWith('http://') || data.startsWith('https://');

      if (isURL) {
        setIsProcessing(true);
        const canOpen = await Linking.canOpenURL(data);
        if (canOpen) {
          await Linking.openURL(data);
          setTimeout(() => {
            setIsProcessing(false);
            setScanned(false);
            router.back();
          }, 1000);
        } else {
          Alert.alert('Error', 'No hay aplicación para abrir este enlace', [
            { text: 'OK', onPress: () => { setScanned(false); setIsProcessing(false); } }
          ]);
        }
        return;
      }

      // If it's not a URL or an internal route, we check if it's a Bus QR (JWT)
      if (data.startsWith('eyJ')) {
        try {
          // Decode enough to show info
          const base64Url = data.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          // Simple base64 decode for JSON in payload
          // In React Native we can use a small polyfill or Buffer if we had it, 
          // but for simple ASCII it's often fine to use a custom one.
          // However, since we want to be safe, we'll assume it's valid if it matches the pattern 
          // and let the backend handle verification, but we want to show info.
          
          // Let's use a very basic decode for the UI
          const decoded = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
          if (decoded && decoded.busId) {
            setBusData(decoded);
            setScannedData(data);
            setShowPurchaseOptions(true);
            return;
          }
        } catch (e) {
          // If decoding fails, fallback to bank options
          console.log('Failed to decode as Bus QR, trying bank options');
        }
      }

      setScannedData(data);
      setShowBankOptions(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo procesar el código', [
        { text: 'OK', onPress: () => { setScanned(false); setIsProcessing(false); } }
      ]);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!scannedData) return;
    
    setIsProcessing(true);
    try {
      await payBusQr.mutateAsync({
        token: scannedData,
        quantity: quantity,
      });

      Alert.alert('¡Pago Exitoso!', `Has pagado ${quantity} pasaje(s) para el bus ${busData?.busId || ''}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error en el pago', error.response?.data?.message || 'No se pudo completar la transacción');
      setIsProcessing(false);
      setScanned(false);
      setShowPurchaseOptions(false);
    }
  };

  const openBankApp = async (bank: typeof BANK_APPS[0]) => {
    setIsProcessing(true);
    setShowBankOptions(false);
    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: bank.deeplink,
          // You can also pass packageName if you want to strictly force that package
          // packageName: bank.androidPackage 
        }).catch(async () => {
             // Fallback if intent fails (e.g. app not installed)
             await Linking.openURL(bank.deeplink);
        });
      } else {
        await Linking.openURL(bank.deeplink);
      }
      setTimeout(() => {
        setIsProcessing(false);
        setScanned(false);
        router.back();
      }, 1000);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo abrir la aplicación del banco');
      setIsProcessing(false);
      setScanned(false);
    }
  };

  if (isProcessing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.successSubtitle}>Procesando...</Text>
      </View>
    );
  }

  if (showBankOptions) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Text style={[styles.successTitle, { marginBottom: 16 }]}>Selecciona tu Banco</Text>
        <Text style={[styles.permissionText, { marginBottom: 32 }]}>¿Con qué app deseas realizar el pago?</Text>
        
        {BANK_APPS.map((bank) => (
          <TouchableOpacity 
            key={bank.id} 
            style={[styles.permissionButton, { width: '100%', alignItems: 'center', marginBottom: 12 }]} 
            onPress={() => openBankApp(bank)}
          >
            <Text style={styles.permissionButtonText}>{bank.name}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[styles.cancelButton, { marginTop: 16 }]} 
          onPress={() => {
            setShowBankOptions(false);
            setScanned(false);
            setScannedData(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showPurchaseOptions) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, padding: 24, justifyContent: 'center' }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        <View style={[styles.purchaseCard, { backgroundColor: colors.surface }, theme.shadows[colorScheme].md]}>
          <View style={styles.iconCircle}>
            <Bus size={32} color={colors.primary} />
          </View>
          
          <Text style={[styles.purchaseTitle, { color: colors.text }]}>Confirmar Pago</Text>
          <Text style={[styles.busName, { color: colors.onSurfaceVariant }]}>
            Bus: {busData?.busId}
          </Text>
          <Text style={[styles.routeName, { color: colors.text }]}>
            {busData?.routeName}
          </Text>
          <Text style={[styles.companyName, { color: colors.onSurfaceVariant }]}>
            {busData?.companyName}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          <View style={styles.quantitySection}>
            <Text style={[styles.label, { color: colors.text }]}>Cantidad de Pasajes</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.qtyBtn, { backgroundColor: colors.background }]} 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity 
                style={[styles.qtyBtn, { backgroundColor: colors.background }]} 
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalSection}>
            <Text style={[styles.totalLabel, { color: colors.onSurfaceVariant }]}>Total a pagar</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${((busData?.amount || 0) * quantity).toLocaleString()}
            </Text>
            <Text style={[styles.unitPrice, { color: colors.onSurfaceVariant }]}>
              (${Number(busData?.amount).toLocaleString()} c/u)
            </Text>
          </View>

          <View style={[styles.balancePreview, { backgroundColor: colors.background }]}>
            <View style={styles.balanceRow}>
              <View style={styles.balanceLabelGroup}>
                <WalletIcon size={16} color={colors.onSurfaceVariant} />
                <Text style={[styles.balanceLabel, { color: colors.onSurfaceVariant }]}>Tu saldo</Text>
              </View>
              <Text style={[styles.balanceValue, { color: colors.text }]}>
                ${Number((wallet?.balance || 0) / 100).toLocaleString()}
              </Text>
            </View>
            
            <View style={[styles.balanceDivider, { backgroundColor: colors.outlineVariant }]} />
            
            <View style={styles.balanceRow}>
              <View style={styles.balanceLabelGroup}>
                <ArrowRight size={16} color={((wallet?.balance || 0) / 100 - (busData?.amount || 0) * quantity) < 0 ? colors.error : colors.primary} />
                <Text style={[styles.balanceLabel, { color: colors.onSurfaceVariant }]}>Después del pago</Text>
              </View>
              <Text style={[
                styles.balanceValue, 
                { color: ((wallet?.balance || 0) / 100 - (busData?.amount || 0) * quantity) < 0 ? colors.error : colors.primary },
                ((wallet?.balance || 0) / 100 - (busData?.amount || 0) * quantity) < 0 && styles.negativeBalance
              ]}>
                ${Math.max(0, (wallet?.balance || 0) / 100 - (busData?.amount || 0) * quantity).toLocaleString()}
              </Text>
            </View>

            {((wallet?.balance || 0) / 100 - (busData?.amount || 0) * quantity) < 0 && (
              <View style={styles.insufficientFundsRow}>
                <Text style={[styles.insufficientFundsText, { color: colors.error }]}>Saldo insuficiente</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.confirmButton, 
              { backgroundColor: colors.primary },
              ((wallet?.balance || 0) / 100 - (busData?.amount || 0) * quantity) < 0 && { opacity: 0.5 }
            ]}
            onPress={handleConfirmPurchase}
            disabled={((wallet?.balance || 0) / 100 - (busData?.amount || 0) * quantity) < 0}
          >
            <ShoppingCart size={20} color={colors.onPrimary} />
            <Text style={styles.confirmButtonText}>Confirmar y Pagar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelLink}
            onPress={() => {
              setShowPurchaseOptions(false);
              setScanned(false);
              setQuantity(1);
            }}
          >
            <Text style={[styles.cancelLinkText, { color: colors.error }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        enableTorch={isFlashOn}
      />
      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View style={styles.scanHeader}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => router.back()}
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.scanHeaderTitle}>Escanea Bre-B QR</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setIsFlashOn(!isFlashOn)}
          >
            {isFlashOn ? <ZapOff size={24} color="#FFF" /> : <Zap size={24} color="#FFF" />}
          </TouchableOpacity>
        </View>

        {/* Scanner frame */}
        <View style={styles.scannerWrapper}>
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <View style={styles.scanLine} />
          </View>
        </View>

        {/* Footer Instruction */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Ubica el código QR del validador dentro del recuadro para pagar tu pasaje
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scanHeaderTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFF',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#008F4C',
    position: 'absolute',
    top: '50%',
    shadowColor: '#008F4C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  instructionContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 24,
    textAlign: 'center',
  },
  successInfo: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  purchaseCard: {
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  busName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  companyName: {
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 20,
  },
  quantitySection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '900',
  },
  unitPrice: {
    fontSize: 12,
    marginTop: 2,
  },
  confirmButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelLink: {
    marginTop: 16,
    padding: 8,
  },
  cancelLinkText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  balancePreview: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  balanceDivider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
    opacity: 0.5,
  },
  negativeBalance: {
    fontWeight: '800',
  },
  insufficientFundsRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  insufficientFundsText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
