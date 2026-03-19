// Vía Libre — Design System Tokens
// Basado en biodiversidad y geografía colombiana

export const colors = {
  primary: {
    esmeralda: '#008F4C',
    esmeraldaDark: '#006B38',
    esmeraldaDeep: '#004D28',
    esmeraldaLight: '#4DB87A',
    esmeraldaPale: '#E8F5EE',
    esmeraldaMid: '#CCE9DA',
  },
  secondary: {
    terracota: '#C0614A',
    terracotaDark: '#9A4337',
    terracotaPale: '#F7EAE7',
    crema: '#F5EDD6',
    cremaDark: '#E8D9B0',
    cieloAndino: '#4A90B8',
    cieloLight: '#EBF4FA',
  },
  neutral: {
    900: '#111827',
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F9FAFB',
    white: '#FFFFFF',
  },
  semantic: {
    success: '#16A34A',
    successLight: '#DCFCE7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    info: '#2563EB',
    infoLight: '#DBEAFE',
  },
  // Transport type colors
  transport: {
    transmilenio: '#C0392B',  // rojo icónico TM
    sitp: '#2980B9',          // azul SITP
    cooperativa: '#F39C12',   // naranja cooperativas
    microbus: '#8E44AD',      // morado microbuses
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'PlusJakartaSans',
    mono: 'SpaceMono',
  },
  fontSize: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  // Colored shadow for the primary CTA button
  esmeralda: {
    shadowColor: '#008F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
