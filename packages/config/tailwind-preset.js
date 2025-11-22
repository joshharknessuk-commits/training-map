const { colors, theme } = require('./colors');

/** @type {import('tailwindcss').Config} */
const config = {
  content: [],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        accent: colors.accent,
        neutral: colors.neutral,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info
      },
      backgroundColor: {
        primary: theme.background.primary,
        secondary: theme.background.secondary,
        tertiary: theme.background.tertiary,
        'accent-bg': theme.background.accent,
        'hover-bg': theme.background.hover
      },
      textColor: {
        primary: theme.text.primary,
        secondary: theme.text.secondary,
        tertiary: theme.text.tertiary,
        disabled: theme.text.disabled,
        'accent-text': theme.text.accent,
        link: theme.text.link
      },
      borderColor: {
        light: theme.border.light,
        DEFAULT: theme.border.DEFAULT,
        dark: theme.border.dark,
        'accent-border': theme.border.accent,
        'focus-border': theme.border.focus
      },
      boxShadow: {
        glow: `0 8px 32px ${theme.shadow.glow}`,
        soft: `0 2px 8px ${theme.shadow.DEFAULT}`,
        card: `0 4px 16px ${theme.shadow.md}`,
        elevated: `0 12px 40px ${theme.shadow.lg}`
      },
      ringColor: {
        DEFAULT: colors.brand[500],
        accent: colors.accent[500]
      }
    }
  },
  plugins: []
};

module.exports = config;
