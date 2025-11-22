/**
 * GrappleMap Design System - Professional SaaS Colors
 * Clean white backgrounds with blue accents and strong black text for readability
 */

const colors = {
  // Primary brand color - Professional blue (#2563EB)
  brand: {
    50: '#EFF6FF',   // Very light blue
    100: '#DBEAFE',  // Light blue
    200: '#BFDBFE',  // Soft blue
    300: '#93C5FD',  // Medium light blue
    400: '#60A5FA',  // Medium blue
    500: '#3B82F6',  // Primary blue
    600: '#2563EB',  // Primary brand blue - main accent
    700: '#1D4ED8',  // Secondary brand blue
    800: '#1E40AF',  // Dark blue
    900: '#1E3A8A'   // Darkest blue
  },

  // Accent color - complementary teal (used sparingly)
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

  // Neutral palette - Strong blacks for text, white for backgrounds
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
    900: '#111827',  // Almost black (body text)
    950: '#030712'   // Pure black (headlines)
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

  // Text colors - Strong contrast for readability
  text: {
    primary: colors.neutral[950],   // Pure black (hero, headlines)
    secondary: colors.neutral[900], // Almost black (body text)
    tertiary: colors.neutral[700],  // Dark gray (labels, captions)
    quaternary: colors.neutral[600],// Medium gray (helper text)
    disabled: colors.neutral[400],  // Medium-light gray (disabled)
    accent: colors.brand[600],      // Brand blue (#2563EB)
    link: colors.brand[600],        // Link blue
    inverse: colors.neutral[0]      // White (on dark backgrounds)
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
