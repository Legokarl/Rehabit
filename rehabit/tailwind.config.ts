import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ff88',
          50: '#e6fff5',
          100: '#ccffeb',
          200: '#99ffd7',
          300: '#66ffc3',
          400: '#33ffaf',
          500: '#00ff88',
          600: '#00cc6d',
          700: '#009952',
          800: '#006637',
          900: '#00331c',
        },
        dark: {
          DEFAULT: '#000000',
          50: '#f7f8f7',
          100: '#e8ebe8',
          200: '#d1d7d1',
          300: '#a3afa3',
          400: '#5a665a',
          500: '#2a2e2a',
          600: '#1a1a1a',
          700: '#121212',
          800: '#0a0a0a',
          900: '#000000',
        },
        accent: {
          green: '#00ff88',
          cyan: '#00ffff',
          purple: '#9d4edd',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-dark': 'radial-gradient(circle at top right, #0a2e1a 0%, #000000 50%, #000000 100%)',
        'gradient-green': 'linear-gradient(135deg, #00ff88 0%, #00cc6d 100%)',
        'gradient-green-subtle': 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 109, 0.1) 100%)',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'glass-dark': 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05))',
        'orb-green': 'radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, rgba(0, 255, 136, 0) 70%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.2)',
        'glow-lg': '0 0 50px rgba(0, 255, 136, 0.5), 0 0 100px rgba(0, 255, 136, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 136, 0.1)',
        'neon': '0 0 5px #00ff88, 0 0 20px #00ff88, 0 0 40px #00ff88',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 60px rgba(0, 255, 136, 0.6)',
            opacity: '0.8'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
