const baseConfig = require('@grapplemap/config/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './state/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/network/src/**/*.{ts,tsx}',
  ],
};
