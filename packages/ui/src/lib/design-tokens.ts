/**
 * GrappleMap Design System - Color Tokens
 * Professional SaaS theme with strong contrast for readability
 */

export const colors = {
  // Brand Colors - Blue accent (used sparingly)
  brand: {
    50: '#EFF6FF',   // Very light blue
    100: '#DBEAFE',  // Light blue
    200: '#BFDBFE',  // Soft blue
    300: '#93C5FD',  // Medium light blue
    400: '#60A5FA',  // Medium blue
    500: '#3B82F6',  // Primary blue
    600: '#2563EB',  // Primary brand blue (main accent)
    700: '#1D4ED8',  // Secondary brand blue
    800: '#1E40AF',  // Dark blue
    900: '#1E3A8A',  // Darkest blue
  },

  // Neutral Colors - Black for text, white for backgrounds
  neutral: {
    0: '#FFFFFF',    // Pure white
    50: '#F9FAFB',   // Off-white
    100: '#F3F4F6',  // Very light gray
    200: '#E5E7EB',  // Light gray (borders)
    300: '#D1D5DB',  // Medium-light gray
    400: '#9CA3AF',  // Medium gray
    500: '#6B7280',  // Gray
    600: '#4B5563',  // Dark gray
    700: '#374151',  // Darker gray
    800: '#1F2937',  // Very dark gray
    900: '#111827',  // Almost black (primary text)
    950: '#030712',  // Pure black
  },

  // Semantic Colors
  success: {
    light: '#D1FAE5',
    DEFAULT: '#10B981',
    dark: '#065F46',
  },
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#92400E',
  },
  error: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#991B1B',
  },
  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#1E40AF',
  },
};

// Design Tokens
export const designTokens = {
  // Backgrounds
  background: {
    primary: colors.neutral[0],      // Pure white
    secondary: colors.neutral[50],   // Off-white
    tertiary: colors.neutral[100],   // Very light gray
    accent: colors.brand[50],        // Light blue tint (subtle)
    hover: colors.neutral[50],       // Hover background
  },

  // Text Colors - Strong contrast for readability
  text: {
    primary: colors.neutral[950],    // Pure black (headlines, hero)
    secondary: colors.neutral[900],  // Almost black (body text)
    tertiary: colors.neutral[700],   // Dark gray (labels)
    quaternary: colors.neutral[600], // Medium gray (helper text)
    disabled: colors.neutral[400],   // Light gray (disabled)
    accent: colors.brand[600],       // Brand blue (links, accents)
    inverse: colors.neutral[0],      // White (on dark backgrounds)
  },

  // Borders
  border: {
    light: colors.neutral[100],      // Very light border
    DEFAULT: colors.neutral[200],    // Default border (#E5E7EB)
    medium: colors.neutral[300],     // Medium border
    dark: colors.neutral[400],       // Darker border
    accent: colors.brand[600],       // Accent border
    focus: colors.brand[500],        // Focus ring
  },

  // Shadows - Subtle and professional
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Interactive States
  interactive: {
    hover: {
      background: colors.neutral[50],
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    active: {
      background: colors.neutral[100],
    },
    focus: {
      ring: `0 0 0 3px ${colors.brand[500]}33`, // 20% opacity
    },
  },
};

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing Scale (based on Tailwind defaults)
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// Animation Timing
export const animation = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
  },
  timing: {
    DEFAULT: 'ease-out',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
};

export default {
  colors,
  designTokens,
  typography,
  spacing,
  borderRadius,
  animation,
};
