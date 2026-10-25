/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2F6FA',
          100: '#E4EDF5',
          200: '#CDDEEE',
          300: '#B2CDE5',
          400: '#A0BDDB',
          500: '#7B9DC2',
          600: '#5A7CA1',
          700: '#415B78',
          800: '#2C3E52',
          900: '#1B2735',
          950: '#0C121A',
        },
        luxury: {
          dark: '#080D1A',
          card: '#0F172B',
          surface: '#15203B',
          border: 'rgba(160, 189, 219, 0.18)',
          glow: 'rgba(160, 189, 219, 0.35)',
          cream: '#FAF9F6',
          rose: '#E8A598',
          gold: '#DFB882',
        }
      },
      fontFamily: {
        serif: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        playfair: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(160, 189, 219, 0.25)',
        'glow-md': '0 0 25px rgba(160, 189, 219, 0.35)',
        'glow-lg': '0 0 45px rgba(160, 189, 219, 0.45)',
        'luxury': '0 20px 40px -15px rgba(8, 13, 26, 0.08), 0 0 1px 1px rgba(160, 189, 219, 0.2)',
        'luxury-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(160, 189, 219, 0.25)'
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
