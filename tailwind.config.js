/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFD580', // Couleur de fond personnalisée
        primary: '#2563eb',
        blue: {
          50: '#f0f7ff',
          100: '#e0edfe',
          200: '#c0dafc',
          300: '#a0c7fa',
          400: '#80b4f8',
          500: '#0A84FF', // Primary
          600: '#0076f5',
          700: '#0067d2',
          800: '#0058af',
          900: '#00498c',
        },
        green: {
          50: '#f2fcf5',
          100: '#e5f9eb',
          200: '#ccf2d7',
          300: '#b2ecc3',
          400: '#99e5af',
          500: '#30D158', // Success
          600: '#2bc150',
          700: '#27ac47',
          800: '#22973d',
          900: '#1e8234',
        },
        amber: {
          50: '#fffbf0',
          100: '#fff7e0',
          200: '#ffefc1',
          300: '#ffe7a3',
          400: '#ffdf84',
          500: '#FF9F0A', // Warning
          600: '#ff9509',
          700: '#e58508',
          800: '#cc7507',
          900: '#b36506',
        },
        red: {
          50: '#fff0f0',
          100: '#ffe0e0',
          200: '#ffc1c1',
          300: '#ffa3a3',
          400: '#ff8484',
          500: '#FF453A', // Error
          600: '#ff3e35',
          700: '#e5372f',
          800: '#cc3129',
          900: '#b32a23',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  
}