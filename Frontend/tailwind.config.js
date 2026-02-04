/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Surreal Dark Theme
        void: {
          900: '#030014', // Deepest background
          950: '#010008',
        },
        surreal: {
          purple: '#2E1065',
          violet: '#7C3AED',
          pink: '#DB2777',
          cyan: '#06B6D4',
        },

        // Semantic Colors
        graphite: {
          50: '#1a1a1a',
          100: '#0f0f0f',
          900: '#0A0A0A',
        },
        border: 'var(--border-color)',
        emerald: {
          accent: '#10b981',
        },
        coral: {
          accent: '#f87171',
        },
      },
      backgroundImage: {
        'surreal-gradient-dark': 'linear-gradient(to bottom right, #030014, #1e1b4b, #312e81)',

      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora': 'aurora 10s linear infinite',
        'slide-light': 'slide-light 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-light': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '5%': { opacity: '0.4' },
          '15%': { opacity: '0.6' },
          '50%': { opacity: '0.7' },
          '85%': { opacity: '0.6' },
          '95%': { opacity: '0.4' },
          '100%': { transform: 'translateX(calc(100vw + 100%))', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

