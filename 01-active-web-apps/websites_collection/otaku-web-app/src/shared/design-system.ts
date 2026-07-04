// Shared Design System for Otaku Network
// Use these tokens across all 3 sites for consistency

export const colors = {
  // Brand colors
  brand: {
    violet: {
      50: '#f5f3ff',
      100: '#ede9fe',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      900: '#4c1d95',
    },
    pink: {
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      900: '#831843',
    },
  },
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Dark theme (primary)
  dark: {
    bg: '#0f0e17',
    bgSecondary: '#1a1a2e',
    bgTertiary: '#0a0a0c',
    border: '#2d2d3a',
  }
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    bold: 700,
    black: 900,
  },
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: '0 0 15px rgba(139, 92, 246, 0.5)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
};

// Component-specific tokens
export const components = {
  button: {
    primary: {
      bg: colors.brand.violet[600],
      bgHover: colors.brand.violet[500],
      text: '#ffffff',
    },
    secondary: {
      bg: colors.gray[800],
      bgHover: colors.gray[700],
      text: colors.gray[300],
    },
    danger: {
      bg: colors.error,
      bgHover: '#dc2626',
      text: '#ffffff',
    },
  },
  card: {
    bg: colors.gray[900],
    border: colors.gray[800],
    borderHover: colors.brand.violet[600],
  },
  input: {
    bg: colors.gray[900],
    border: colors.gray[700],
    borderFocus: colors.brand.violet[500],
    text: '#ffffff',
    placeholder: colors.gray[600],
  },
};

// Accessibility helpers
export const a11y = {
  focusRing: `0 0 0 3px ${colors.brand.violet[600]}40`,
  minTouchTarget: '44px', // WCAG 2.1 Level AAA
};

/** Re-export rarity tokens for cross-app gamification UI */
export { RARITY_TAILWIND, RARITY_CSS_VARS, normalizeRarity } from './gamification/rarityTokens';
