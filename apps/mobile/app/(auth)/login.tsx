import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Dimensions,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Chrome, Apple, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#006a37',
  primaryContainer: '#008647',
  onPrimary: '#ffffff',
  secondary: '#9e4127',
  tertiary: '#705740',
  background: '#fcf9f5',
  surfaceLowest: '#ffffff',
  surfaceLow: '#f6f3ef',
  onSurface: '#1c1c1a',
  onSurfaceVariant: '#3e4a3f',
  outline: '#6e7a6e',
  outlineVariant: '#bdcabc',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;
      await setAuth(user, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Mesh Gradients */}
      <View style={styles.meshContainer}>
        <LinearGradient
          colors={['rgba(0, 106, 55, 0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradientTopLeft}
        />
        <LinearGradient
          colors={['rgba(158, 65, 39, 0.05)', 'transparent']}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradientBottomRight}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Header / Brand */}
            <View style={styles.header}>
              <Text style={styles.brandTitle}>Vía Libre</Text>
              <Text style={styles.brandSubtitle}>TU MOVILIDAD, TU CIUDAD</Text>
            </View>

            {/* Main Login Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>

              <View style={styles.form}>
                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Mail size={20} color={COLORS.outline} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="nombre@ejemplo.com"
                      placeholderTextColor={`${COLORS.outline}80`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Contraseña</Text>
                    <TouchableOpacity>
                      <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Lock size={20} color={COLORS.outline} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={`${COLORS.outline}80`}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o continúa con</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Logins */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialButton}>
                  <Chrome size={20} color={COLORS.onSurface} strokeWidth={2.5} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, styles.socialButtonDark]}>
                  <Apple size={20} color={COLORS.background} fill={COLORS.background} />
                  <Text style={[styles.socialButtonText, styles.socialButtonTextLight]}>Apple</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ¿No tienes cuenta?{' '}
                <Text style={styles.registerLink}>Regístrate</Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  meshContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.5,
  },
  gradientBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: width,
    height: height * 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif-condensed',
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.tertiary,
    letterSpacing: 1.5,
    opacity: 0.8,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: 32,
    padding: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.05,
    shadowRadius: 48,
    elevation: 8,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}20`,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.tertiary,
    paddingHorizontal: 4,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${COLORS.outlineVariant}50`,
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.outline,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceLow,
    paddingVertical: 14,
    borderRadius: 12,
  },
  socialButtonDark: {
    backgroundColor: COLORS.onSurface,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  socialButtonTextLight: {
    color: COLORS.background,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
