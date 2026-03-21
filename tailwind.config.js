/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: '#root',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#050A14',
          900: '#0A0F1E',
          800: '#0F1829',
          700: '#141F35',
          600: '#1A2741',
        },
        accent: {
          DEFAULT: '#00E676',
          dim: '#00C853',
          glow: 'rgba(0,230,118,0.15)',
        },
        slate: {
          custom: '#6B7A99',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,230,118,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(0,230,118,0.6)' },
        }
      }
    },
  },
  plugins: [],
}
