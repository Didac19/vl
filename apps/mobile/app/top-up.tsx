import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTopUpWallet } from '../lib/queries';
import { useColorScheme } from '../components/useColorScheme';
import Colors from '../constants/Colors';

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000];

export default function TopUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, isDark);

  const [amount, setAmount] = useState<string>('');
  const topUpMutation = useTopUpWallet();

  const handleTopUp = () => {
    const value = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto válido.');
      return;
    }

    // Amount is in pesos, backend expects cents
    topUpMutation.mutate(value * 100, {
      onSuccess: () => {
        Alert.alert('Recarga exitosa', `Has recargado $${value.toLocaleString()} a tu billetera.`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (error: any) => {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo realizar la recarga.');
      }
    });
  };

  const handlePresetSelect = (preset: number) => {
    setAmount(preset.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.logoText}>Recargar</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Wallet size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>¿Cuánto deseas recargar?</Text>
          <Text style={styles.subtitle}>Selecciona un monto o ingresa uno personalizado</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.presetsGrid}>
          {PRESET_AMOUNTS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                amount === preset.toString() && styles.presetButtonActive
              ]}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  amount === preset.toString() && styles.presetTextActive
                ]}
              >
                ${preset.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.payButton, topUpMutation.isPending && styles.payButtonDisabled]} 
          onPress={handleTopUp}
          disabled={topUpMutation.isPending}
        >
          {topUpMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>Recargar Saldo</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any, isDark: boolean) => StyleSheet.create({
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
    height: 72,
    backgroundColor: isDark ? colors.surface : '#064E3B',
  },
  iconButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    marginRight: 8,
  },
  input: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    minWidth: 100,
    textAlign: 'center',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  presetButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  presetTextActive: {
    color: colors.primary,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
