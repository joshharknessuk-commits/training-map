/**
 * GrappleMap Color Scheme - Light Theme
 * Centralized color definitions for consistent theming across all pages
 */

const colors = {
  // Primary brand color - soft blue/teal palette
  brand: {
    50: '#F0F9FF',   // Very light blue
    100: '#E0F2FE',  // Light blue
    200: '#BAE6FD',  // Soft blue
    300: '#7DD3FC',  // Medium blue
    400: '#38BDF8',  // Bright blue
    500: '#0EA5E9',  // Primary brand blue
    600: '#0284C7',  // Deep blue
    700: '#0369A1',  // Darker blue
    800: '#075985',  // Very dark blue
    900: '#0C4A6E'   // Deepest blue
  },

  // Accent color - complementary teal
  accent: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A'
  },

  // Neutral palette for text and backgrounds
  neutral: {
    50: '#F8FAFC',   // Almost white
    100: '#F1F5F9',  // Very light gray
    200: '#E2E8F0',  // Light gray
    300: '#CBD5E1',  // Medium-light gray
    400: '#94A3B8',  // Medium gray
    500: '#64748B',  // Gray
    600: '#475569',  // Dark gray
    700: '#334155',  // Darker gray
    800: '#1E293B',  // Very dark gray
    900: '#0F172A'   // Almost black
  },

  // Semantic colors
  success: {
    light: '#D1FAE5',
    DEFAULT: '#10B981',
    dark: '#065F46'
  },
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#92400E'
  },
  error: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#991B1B'
  },
  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#1E40AF'
  }
};

// Theme tokens for consistent usage
const theme = {
  // Background colors
  background: {
    primary: '#FFFFFF',           // Pure white
    secondary: colors.neutral[50], // Almost white
    tertiary: colors.neutral[100], // Very light gray
    accent: colors.brand[50],      // Light blue tint
    hover: colors.neutral[100]     // Hover state
  },

  // Text colors
  text: {
    primary: colors.neutral[900],   // Almost black
    secondary: colors.neutral[700], // Dark gray
    tertiary: colors.neutral[600],  // Medium-dark gray
    disabled: colors.neutral[400],  // Medium-light gray
    accent: colors.brand[600],      // Brand blue
    link: colors.brand[500]         // Link blue
  },

  // Border colors
  border: {
    light: colors.neutral[200],     // Light border
    DEFAULT: colors.neutral[300],   // Default border
    dark: colors.neutral[400],      // Darker border
    accent: colors.brand[300],      // Accent border
    focus: colors.brand[500]        // Focus ring
  },

  // Button colors
  button: {
    primary: {
      bg: colors.brand[500],
      bgHover: colors.brand[600],
      text: '#FFFFFF'
    },
    secondary: {
      bg: colors.neutral[100],
      bgHover: colors.neutral[200],
      text: colors.neutral[900]
    },
    accent: {
      bg: colors.accent[500],
      bgHover: colors.accent[600],
      text: '#FFFFFF'
    }
  },

  // Shadow colors
  shadow: {
    sm: 'rgba(15, 23, 42, 0.04)',    // Very subtle
    DEFAULT: 'rgba(15, 23, 42, 0.08)', // Subtle
    md: 'rgba(15, 23, 42, 0.12)',    // Medium
    lg: 'rgba(15, 23, 42, 0.16)',    // Larger
    xl: 'rgba(15, 23, 42, 0.20)',    // Extra large
    glow: 'rgba(14, 165, 233, 0.25)' // Brand glow
  }
};

module.exports = {
  colors,
  theme
};
