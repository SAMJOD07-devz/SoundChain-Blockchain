/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14120F',
          dark: '#0D0C0A',
          surface: '#1A1814',
          subtle: '#22201B',
        },
        paper: {
          DEFAULT: '#F6F1E7',
          dark: '#EAE4D8',
          subtle: '#DDD5C7',
        },
        brass: {
          DEFAULT: '#C9A24B',
          light: '#E2BF6B',
          dim: '#8A7238',
          muted: 'rgba(201, 162, 75, 0.15)',
        },
        signal: {
          DEFAULT: '#4C6B5C',
          light: '#658C7A',
          dim: '#33483E',
        },
        ash: {
          DEFAULT: '#8C8578',
          light: '#B2ABA0',
          dark: '#5B554C',
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.035em',
        tighter: '-0.02em',
        widest: '0.12em',
      },
      boxShadow: {
        'brass-glow': '0 0 35px -5px rgba(201, 162, 75, 0.25)',
        'paper-card': '0 2px 8px -2px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(138, 114, 56, 0.18)',
        'ledger-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'ticker': 'ticker 35s linear infinite',
        'subtle-spin': 'spin 30s linear infinite',
        'pulse-brass': 'pulseBrass 1.8s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseBrass: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
