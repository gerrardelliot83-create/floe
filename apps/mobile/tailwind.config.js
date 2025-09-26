/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ultra-minimalist monochrome palette (same as web)
        background: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        border: {
          light: '#F0F0F0',
          dark: '#1A1A1A',
        },
        divider: {
          light: '#F7F7F7',
          dark: '#0D0D0D',
        },
        text: {
          primary: {
            light: '#000000',
            dark: '#FFFFFF',
          },
          secondary: {
            light: '#666666',
            dark: '#999999',
          },
          tertiary: {
            light: '#999999',
            dark: '#666666',
          },
          disabled: {
            light: '#CCCCCC',
            dark: '#333333',
          },
        },
      },
      fontFamily: {
        sans: ['System'],
        mono: ['Menlo', 'monospace'],
      },
      fontSize: {
        micro: 11,
        xs: 12,
        sm: 13,
        base: 15,
        lg: 17,
        xl: 21,
        '2xl': 27,
        '3xl': 32,
        display: 48,
      },
      spacing: {
        micro: 4,
        xs: 8,
        sm: 16,
        md: 24,
        lg: 40,
        xl: 64,
        xxl: 96,
        xxxl: 128,
      },
    },
  },
  plugins: [],
};