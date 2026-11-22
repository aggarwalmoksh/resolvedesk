/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-0': 'var(--surface-0)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',

        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary':  'var(--text-tertiary)',
        'text-inverse':   'var(--text-inverse)',

        'border-subtle':  'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong':  'var(--border-strong)',

        brand: {
          50: 'var(--brand-50)', 100: 'var(--brand-100)', 200: 'var(--brand-200)',
          300: 'var(--brand-300)', 400: 'var(--brand-400)', 500: 'var(--brand-500)',
          600: 'var(--brand-600)', 700: 'var(--brand-700)', 800: 'var(--brand-800)',
          900: 'var(--brand-900)', 950: 'var(--brand-950)',
        },
        secondary: {
          50: 'var(--secondary-50)', 100: 'var(--secondary-100)', 200: 'var(--secondary-200)',
          300: 'var(--secondary-300)', 400: 'var(--secondary-400)', 500: 'var(--secondary-500)',
          600: 'var(--secondary-600)', 700: 'var(--secondary-700)', 800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
        },
        accent: {
          50: 'var(--accent-50)', 100: 'var(--accent-100)', 200: 'var(--accent-200)',
          300: 'var(--accent-300)', 400: 'var(--accent-400)', 500: 'var(--accent-500)',
          600: 'var(--accent-600)', 700: 'var(--accent-700)', 800: 'var(--accent-800)',
          900: 'var(--accent-900)',
        },
        success: {
          50: 'var(--success-50)', 100: 'var(--success-100)',
          500: 'var(--success-500)', 600: 'var(--success-600)', 700: 'var(--success-700)',
        },
        warning: {
          50: 'var(--warning-50)', 100: 'var(--warning-100)',
          500: 'var(--warning-500)', 600: 'var(--warning-600)', 700: 'var(--warning-700)',
        },
        danger: {
          50: 'var(--danger-50)', 100: 'var(--danger-100)',
          500: 'var(--danger-500)', 600: 'var(--danger-600)', 700: 'var(--danger-700)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        'safe-t': 'env(safe-area-inset-top, 0px)',
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        hit: '44px',
      },
      minHeight: { hit: '44px' },
      minWidth: { hit: '44px' },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
        'glow-cta': 'var(--shadow-glow-cta)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
        spring: 'var(--ease-spring)',
        squish: 'var(--ease-squish)',
        decel: 'var(--ease-decel)',
        accel: 'var(--ease-accel)',
      },
      animation: {
        'fade-in':    'fade-in 200ms var(--ease-out-expo) forwards',
        'scale-in':   'scale-in 250ms var(--ease-out-expo) forwards',
        'slide-up':   'slide-up 300ms var(--ease-out-expo) forwards',
        'slide-down': 'slide-down 300ms var(--ease-out-expo) forwards',
        'stagger-in': 'stagger-in 350ms var(--ease-out-expo) forwards',
        skeleton:     'skeleton-sweep 1.6s ease-in-out 3',
        shake:        'shake 400ms var(--ease-squish)',
        progress:     'progress-bar 2s var(--ease-out-expo) forwards',
      },
      keyframes: {
        'fade-in':    { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in':   { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-up':   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-down': { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'stagger-in': { from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'skeleton-sweep': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '15%':  { transform: 'translateX(-6px)' },
          '30%':  { transform: 'translateX(5px)' },
          '45%':  { transform: 'translateX(-4px)' },
          '60%':  { transform: 'translateX(2px)' },
          '75%':  { transform: 'translateX(-1px)' },
        },
        'progress-bar': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
    },
  },
  plugins: [],
};
