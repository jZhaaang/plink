const palette = {
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',

  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',

  neutral50: '#fafafa',

  red500: '#ef4444',
  red600: '#dc2626',

  emerald500: '#10b981',

  amber600: '#d97706',

  white: '#ffffff',
  gray300: '#d1d5db',
  gray700: '#374151',
  black: '#000000',
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const lightTheme = {
  colors: {
    background: palette.neutral50,
    surface: palette.white,
    surfacePressed: palette.slate100,

    primary: palette.blue600,
    primaryLight: palette.blue200,
    primaryText: palette.white,

    textPrimary: palette.slate900,
    textSecondary: palette.slate700,
    textTertiary: palette.slate500,
    textPlaceholder: palette.slate400,
    textInverse: palette.white,

    border: palette.slate200,
    borderLight: palette.slate100,
    borderInput: palette.slate300,

    error: palette.red500,
    errorDark: palette.red600,
    success: palette.emerald500,
    info: palette.blue500,

    overlay: 'rgba(0,0,0,0.5)',
    overlayLight: 'rgba(0,0,0,0.2)',
    overlayMedium: 'rgba(0,0,0,0.3)',

    icon: palette.slate500,
    iconSecondary: palette.slate600,
    disabled: 0.6,

    spinnerBrand: palette.blue600,
    spinnerInverse: palette.white,
    spinnerMuted: palette.slate600,

    white: palette.white,
    lightGray: palette.gray300,
    darkGray: palette.gray700,
    black: palette.black,

    accentSurface: palette.blue50,
    accentSurfaceLight: palette.blue100,
    accentText: palette.blue700,
    warning: palette.amber600,
    badgeActive: 'rgba(16, 185, 129, 0.9)',
    badgeInactive: 'rgba(15, 23, 42, 0.65)',
  },

  spacing,
  radii,
  fontSizes,
  fontWeights,

  shadows: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },
} as const;

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: palette.slate900,
    surface: palette.slate800,
    surfacePressed: palette.slate700,

    textPrimary: palette.slate50,
    textSecondary: palette.slate300,
    textTertiary: palette.slate400,
    textPlaceholder: palette.slate500,

    border: palette.slate700,
    borderLight: palette.slate800,
    borderInput: palette.slate600,
  },
} as const;

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}
