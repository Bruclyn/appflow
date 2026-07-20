import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2D3FE7', dark: '#1E2EBF', light: '#EEF0FD' },
        secondary: { DEFAULT: '#7C3AED', light: '#EDE9FE' },
        success: { DEFAULT: '#10B981', light: '#D1FAE5' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7' },
        danger: { DEFAULT: '#EF4444', light: '#FEE2E2' },
        surface: '#FFFFFF',
        border: '#E4E7EE',
        muted: '#94A3B8',
      },
      fontFamily: {
        // next/font exposes each family through a CSS variable; keep the literal
        // names as fallbacks so the tokens still read as intended.
        display: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        elevated: '0 4px 24px rgba(0,0,0,0.10)',
        ai: '0 0 0 3px rgba(124,58,237,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
