/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ultra-minimalist monochrome palette
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
        hover: {
          light: 'rgba(0, 0, 0, 0.02)',
          dark: 'rgba(255, 255, 255, 0.02)',
        },
        pressed: {
          light: 'rgba(0, 0, 0, 0.04)',
          dark: 'rgba(255, 255, 255, 0.04)',
        },
        selected: {
          light: 'rgba(0, 0, 0, 0.06)',
          dark: 'rgba(255, 255, 255, 0.06)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        micro: ['11px', { lineHeight: '1.3' }],
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.4' }],
        base: ['15px', { lineHeight: '1.5' }],
        lg: ['17px', { lineHeight: '1.5' }],
        xl: ['21px', { lineHeight: '1.4' }],
        '2xl': ['27px', { lineHeight: '1.3' }],
        '3xl': ['32px', { lineHeight: '1.2' }],
        display: ['48px', { lineHeight: '1.1' }],
      },
      spacing: {
        micro: '4px',
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '40px',
        xl: '64px',
        xxl: '96px',
        xxxl: '128px',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
      },
      borderRadius: {
        subtle: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
        sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
        md: '0 4px 8px rgba(0, 0, 0, 0.08)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-in': 'slideIn 250ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};