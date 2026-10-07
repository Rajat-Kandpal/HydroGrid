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
        obsidian: {
          950: '#030507',
          900: '#05070B',
          850: '#080C12',
          800: '#0D131F',
          700: '#151F32',
          600: '#1E2B45',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        solar: {
          DEFAULT: '#FF4500',
          hover: '#FF5E1E',
          glow: 'rgba(255, 69, 0, 0.25)',
          muted: '#8A2D07',
          gold: '#FFB300'
        },
        hydro: {
          DEFAULT: '#00E5FF',
          hover: '#33EBFF',
          glow: 'rgba(0, 229, 255, 0.25)',
          muted: '#006575',
          azure: '#0077FF'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Cinzel"', 'serif']
      },
      animation: {
        'radar-sweep': 'radar 3.5s linear infinite',
        'pulse-glow-amber': 'pulseAmber 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow-cyan': 'pulseCyan 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        pulseAmber: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 69, 0, 0.4), inset 0 0 15px rgba(255, 69, 0, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 69, 0, 0.8), inset 0 0 25px rgba(255, 69, 0, 0.4)' }
        },
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 229, 255, 0.4), inset 0 0 15px rgba(0, 229, 255, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 229, 255, 0.8), inset 0 0 25px rgba(0, 229, 255, 0.4)' }
        },
        scanline: {
          '0%': { top: '0%' },
          '100%': { top: '100%' }
        }
      }
    },
  },
  plugins: [],
}
