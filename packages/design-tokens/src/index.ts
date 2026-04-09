// ============================================================
// @baby-monitor/design-tokens
// Design system tokens — colors, spacing, typography, radii
// Platform-agnostic values consumed by web CSS and RN styles
// ============================================================

// ---- Color Tokens ----

export const colors = {
  // Brand
  teal: {
    50: '#E1F5EE',
    100: '#9FE1CB',
    200: '#5DCAA5',
    400: '#1D9E75',
    500: '#2DD4A8',
    600: '#0F6E56',
    800: '#085041',
    900: '#04342C',
  },
  coral: {
    50: '#FAECE7',
    100: '#F5C4B3',
    200: '#F0997B',
    400: '#D85A30',
    600: '#993C1D',
    800: '#712B13',
    900: '#4A1B0C',
  },
  amber: {
    50: '#FAEEDA',
    100: '#FAC775',
    400: '#EF9F27',
    600: '#BA7517',
    800: '#854F0B',
  },
  red: {
    50: '#FCEBEB',
    100: '#F7C1C1',
    400: '#E24B4A',
    600: '#A32D2D',
    800: '#791F1F',
  },

  // Neutrals
  gray: {
    50: '#F8F7F4',
    100: '#EEEDEA',
    200: '#D8D5CC',
    300: '#B4B2A9',
    400: '#888780',
    500: '#6B6880',
    600: '#5F5E5A',
    700: '#444441',
    800: '#2C2C2A',
    900: '#1A1A1A',
    950: '#0C0B0F',
  },

  // Semantic
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ---- Semantic Color Aliases ----

export const semantic = {
  bg: {
    primary: colors.gray[950],
    secondary: colors.gray[800],
    surface: colors.gray[700],
    elevated: colors.gray[600],
  },
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    muted: colors.gray[400],
    inverse: colors.gray[950],
  },
  status: {
    connected: colors.teal[500],
    reconnecting: colors.amber[400],
    disconnected: colors.red[400],
    silence: colors.gray[400],
    quiet: colors.teal[500],
    moderate: colors.amber[400],
    loud: colors.red[400],
  },
  border: {
    subtle: 'rgba(255,255,255,0.08)',
    default: 'rgba(255,255,255,0.12)',
    strong: 'rgba(255,255,255,0.20)',
  },
  alert: {
    overlay: 'rgba(226, 75, 74, 0.3)',
    bg: colors.red[600],
    text: colors.white,
  },
} as const;

// ---- Spacing Tokens ----

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
  24: 96,
} as const;

// ---- Typography Tokens ----

export const typography = {
  family: {
    sans: 'System', // maps to SF Pro on iOS, Roboto on Android
    mono: 'monospace', // maps to SF Mono / Roboto Mono
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    display: 64,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// ---- Border Radius Tokens ----

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ---- Shadow Tokens ----

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ---- Animation Tokens ----

export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ---- dB Level Thresholds ----

export const dbThresholds = {
  silence: -45,
  quiet: -30,
  moderate: -20,
} as const;

export function getDbColor(db: number): string {
  if (db < dbThresholds.silence) return semantic.status.silence;
  if (db < dbThresholds.quiet) return semantic.status.quiet;
  if (db < dbThresholds.moderate) return semantic.status.moderate;
  return semantic.status.loud;
}

// ---- CSS Variable Export (for web) ----

export function toCssVariables(): string {
  const vars: string[] = [];

  const flatColors = (prefix: string, obj: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        vars.push(`--${prefix}-${key}: ${value};`);
      } else if (typeof value === 'object' && value !== null) {
        flatColors(`${prefix}-${key}`, value as Record<string, unknown>);
      }
    }
  };

  flatColors('color', colors);
  flatColors('semantic', semantic);

  for (const [key, value] of Object.entries(spacing)) {
    vars.push(`--spacing-${key}: ${value}px;`);
  }

  for (const [key, value] of Object.entries(typography.size)) {
    vars.push(`--font-size-${key}: ${value}px;`);
  }

  for (const [key, value] of Object.entries(radii)) {
    vars.push(`--radius-${key}: ${value === 9999 ? '9999px' : `${value}px`};`);
  }

  return `:root {\n  ${vars.join('\n  ')}\n}`;
}
