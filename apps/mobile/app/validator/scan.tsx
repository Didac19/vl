import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, LogOut, User, QrCode as QrIcon, Settings, Bus, MapPin, ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@transix/shared-types';

interface RouteConfig {
  id: string;
  name: string;
  fareAmount: number;
}

interface ValidatorConfig {
  companyName: string;
  breBCode: string;
  routes: RouteConfig[];
}

export default function ValidatorScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isKioskMode = user?.role === UserRole.VALIDATOR;
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [config, setConfig] = useState<ValidatorConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null);
  const [tripId, setTripId] = useState('');
  const [isRouteModalVisible, setIsRouteModalVisible] = useState(false);
  const [customQrImage, setCustomQrImage] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<{ timeoutId: NodeJS.Timeout, intervalId: NodeJS.Timeout } | null>(null);
  const [countdown, setCountdown] = useState(0);

  const QR_IMAGE_PATH = `${FileSystem.documentDirectory}company_qr_image.jpg`;

  useEffect(() => {
    return () => {
      if (pendingConfirmation) {
        clearTimeout(pendingConfirmation.timeoutId);
        clearInterval(pendingConfirmation.intervalId);
      }
    };
  }, [pendingConfirmation]);

  useEffect(() => {
    fetchConfig();
    const today = new Date();
    setTripId(`TRIP-${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`);
    loadCustomQr();
  }, []);

  const loadCustomQr = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(QR_IMAGE_PATH);
      if (fileInfo.exists) {
        setCustomQrImage(QR_IMAGE_PATH + '?t=' + Date.now()); // cache busting
      }
    } catch (e) {}
  };

  const handlePickQrImage = async () => {
    if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.COMPANY_ADMIN) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const uri = result.assets[0].uri;
        await FileSystem.copyAsync({
          from: uri,
          to: QR_IMAGE_PATH
        });
        setCustomQrImage(QR_IMAGE_PATH + '?t=' + Date.now());
      } catch (e) {
        Alert.alert("Error", "No se pudo guardar la imagen");
      }
    }
  };

  const handleClearQrImage = async () => {
    if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.COMPANY_ADMIN) return;
    setCustomQrImage(null);
    try {
      await FileSystem.deleteAsync(QR_IMAGE_PATH, { idempotent: true });
    } catch (e) {}
  };

  const fetchConfig = async () => {
    try {
      const response = await api.get('/tickets/validator-config');
      setConfig(response.data);
      if (response.data.routes.length > 0) {
        setSelectedRoute(response.data.routes[0]);
      }
    } catch (e: any) {
      console.error('Error fetching validator config:', e);
      Alert.alert('Error', 'No se pudo cargar la configuración del validador');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleConfirmBoarding = async () => {
    if (!selectedRoute) {
      Alert.alert('Atención', 'Por favor seleccione una ruta primero');
      return;
    }

    if (isConfirming || pendingConfirmation) return;

    setCountdown(3);
    
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeoutId = setTimeout(async () => {
      setPendingConfirmation(null);
      setIsConfirming(true);
      
      try {
        await api.post('/tickets/confirm-boarding', {
          routeId: selectedRoute.id,
          tripId: tripId,
          amount: selectedRoute.fareAmount,
        });
        
        Alert.alert('Éxito', 'Abordo confirmado exitosamente');
      } catch (e: any) {
        const errorMsg = e.response?.data?.message;
        Alert.alert('Error', Array.isArray(errorMsg) ? errorMsg.join(', ') : (errorMsg || 'Error al confirmar abordo'));
      } finally {
        setIsConfirming(false);
      }
    }, 3000);

    setPendingConfirmation({ timeoutId, intervalId });
  };

  const handleCancelConfirmation = () => {
    if (pendingConfirmation) {
      clearTimeout(pendingConfirmation.timeoutId);
      clearInterval(pendingConfirmation.intervalId);
      setPendingConfirmation(null);
      setCountdown(0);
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

  if (isLoadingConfig) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.text }}>Cargando configuración...</Text>
      </View>
    );
  }

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
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Bre-B Validator</Text>
          <Text style={styles.companySubTitle}>{config?.companyName}</Text>
        </View>
        <TouchableOpacity style={styles.headerIconButton}>
          <Settings size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Route Selector */}
        <View style={[styles.configCard, { borderColor: colors.border || '#DDD' }]}>
          <View style={styles.configItem}>
            <View style={styles.configLabelContainer}>
              <Bus size={18} color={colors.primary} />
              <Text style={[styles.configLabel, { color: colors.text }]}>Ruta Activa</Text>
            </View>
            <TouchableOpacity 
              style={[styles.routeSelector, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}
              onPress={() => setIsRouteModalVisible(true)}
            >
              <Text style={[styles.routeSelectorText, { color: colors.text }]}>
                {selectedRoute ? selectedRoute.name : 'Seleccionar Ruta'}
              </Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configLabelContainer}>
              <MapPin size={18} color={colors.primary} />
              <Text style={[styles.configLabel, { color: colors.text }]}>ID Viaje / Bus</Text>
            </View>
            <TextInput
              style={[styles.tripInput, { color: colors.text, backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}
              value={tripId}
              onChangeText={setTripId}
              placeholder="Ej: BUS-001"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.qrSection}>
          <Text style={[styles.qrInstruction, { color: colors.text }]}>
            Escanea para pagar el pasaje
          </Text>
          
          <TouchableOpacity 
            style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]}
            onPress={user?.role === UserRole.ADMIN || user?.role === UserRole.COMPANY_ADMIN ? handlePickQrImage : undefined}
            onLongPress={user?.role === UserRole.ADMIN || user?.role === UserRole.COMPANY_ADMIN ? handleClearQrImage : undefined}
            activeOpacity={user?.role === UserRole.ADMIN || user?.role === UserRole.COMPANY_ADMIN ? 0.7 : 1}
          >
            {customQrImage ? (
              <Image 
                source={{ uri: customQrImage }} 
                style={{ width: 200, height: 200 }} 
                resizeMode="contain"
              />
            ) : (
              <QRCode 
                value={config?.breBCode || 'BRE_B_PENDING'} 
                size={200}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            )}
            <Text style={styles.breBText}>Paga con Bre-B</Text>
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.COMPANY_ADMIN) && (
              <Text style={{ marginTop: 8, fontSize: 12, color: '#666', textAlign: 'center' }}>
                Admin: Toque para cambiar QR{'\n'}Mantenga presionado para restaurar
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.amountText, { color: colors.primary }]}>
            {selectedRoute ? `$${selectedRoute.fareAmount.toLocaleString()}` : '--'}
          </Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={[styles.actionInstruction, { color: colors.text }]}>
            Verifique el pago en la pantalla del usuario
          </Text>
          
          {pendingConfirmation ? (
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: '#FF3B30' }]} 
              onPress={handleCancelConfirmation}
            >
              <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>
                Cancelar ({countdown}s)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: colors.primary }]} 
              onPress={handleConfirmBoarding}
              disabled={isConfirming || !selectedRoute}
            >
              {isConfirming ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <CheckCircle2 size={24} color={colors.onPrimary} style={{ marginRight: 12 }} />
                  <Text style={[styles.confirmButtonText, { color: colors.onPrimary }]}>
                    Confirmar Abordo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Route Selection Modal */}
      <Modal
        visible={isRouteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRouteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Ruta</Text>
            <ScrollView style={styles.routeList}>
              {config?.routes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeOption,
                    selectedRoute?.id === route.id && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => {
                    setSelectedRoute(route);
                    setIsRouteModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.routeOptionText, 
                    { color: colors.text },
                    selectedRoute?.id === route.id && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {route.name}
                  </Text>
                  <Text style={[styles.routeFareText, { color: colors.text + '40' }]}>
                    ${route.fareAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.closeModalButton, { backgroundColor: colors.border || '#DDD' }]}
              onPress={() => setIsRouteModalVisible(false)}
            >
              <Text style={[styles.closeModalButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  companySubTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  configCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  configItem: {
    marginBottom: 16,
  },
  configLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  routeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  routeSelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tripInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrInstruction: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  breBText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '900',
  },
  actionCard: {
    marginBottom: 20,
  },
  actionInstruction: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  confirmButtonText: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
  },
  routeList: {
    marginBottom: 20,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 8,
  },
  routeOptionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  routeFareText: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeModalButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
