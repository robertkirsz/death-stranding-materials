/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ds-dark': '#0a0a0a',
        'ds-darker': '#050505',
        'ds-gray': '#1a1a1a',
        'ds-light-gray': '#2a2a2a',
        'ds-blue': '#4a9eff',
        'ds-cyan': '#00d4ff',
        'ds-green': '#00ff88',
        'ds-orange': '#ff6b35',
        'ds-red': '#ff4757'
      },
      fontFamily: {
        ds: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #4a9eff, 0 0 10px #4a9eff, 0 0 15px #4a9eff' },
          '100%': { boxShadow: '0 0 10px #4a9eff, 0 0 20px #4a9eff, 0 0 30px #4a9eff' }
        }
      }
    }
  },
  plugins: []
}
