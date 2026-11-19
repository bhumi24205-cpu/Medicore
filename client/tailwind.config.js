/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Required MediCore Healthcare Palette
        primary: {
          DEFAULT: '#123B5D', // Deep Navy Blue
          dark: '#0C273E',
          light: '#1B4E79',
          50: '#F0F6FA',
          100: '#E1EDF5',
          200: '#C2DBEB',
          700: '#0E2F4A',
          800: '#0C273E',
          900: '#081A2B',
        },
        secondary: {
          DEFAULT: '#16A6A1', // Teal
          dark: '#118480',
          light: '#35C2BD',
          50: '#EBF8F7',
          100: '#D7F1F0',
          200: '#AFE4E2',
          700: '#0F7370',
          800: '#0C5A57'
        },
        ice: {
          DEFAULT: '#F5FAFC', // Soft Ice Blue Background
          50: '#FAFDFE',
          100: '#F5FAFC',
          200: '#EBF4F8',
          300: '#DFEDF4',
          400: '#C9E1EC'
        },
        charcoal: {
          DEFAULT: '#263746', // Dark Charcoal Text
          dark: '#19242E',
          light: '#475A6C',
          muted: '#657B8F',
          subtle: '#8C9FA8'
        },
        mint: {
          DEFAULT: '#DDF3EE', // Soft Mint Accent
          light: '#EEFAF7',
          dark: '#BFE7DE',
          text: '#0C685B'
        },
        // Backward-compatible aliases for existing portal components
        medicore: {
          sidebar: '#123B5D',
          teal: '#16A6A1',
          'teal-dark': '#118480',
          'teal-light': '#DDF3EE',
          coral: '#E05D52',
          'coral-light': '#FDEDEB',
          navy: '#0C273E',
          bg: '#F5FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          text: '#263746',
          muted: '#657B8F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
        serif: ['Manrope', 'sans-serif'] // Alias for headings using serif
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(18, 59, 93, 0.06)',
        'hover': '0 12px 30px -4px rgba(18, 59, 93, 0.12)',
        'card': '0 2px 12px rgba(18, 59, 93, 0.04)',
        'glow': '0 0 25px rgba(22, 166, 161, 0.25)'
      }
    },
  },
  plugins: [],
}
