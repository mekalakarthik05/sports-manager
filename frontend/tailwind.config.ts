import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f0f12',
          800: '#16161c',
          700: '#1e1e26',
          600: '#282830',
          500: '#34343e',
        },
        accent: {
          gold: '#f59e0b',
          silver: '#94a3b8',
          bronze: '#b45309',
          live: '#ef4444',
          primary: '#e11d48',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      safe: {
        'bottom-nav': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
};

export default config;
