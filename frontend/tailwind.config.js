/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Apple-inspired color palette
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dfff',
          300: '#7cc4ff',
          400: '#36a3ff',
          500: '#0a84ff', // Apple blue
          600: '#0071e3', // Apple link blue
          700: '#005bb5',
          800: '#004a93',
          900: '#003d7a',
          DEFAULT: '#0071e3',
        },
        apple: {
          gray: {
            1: '#f5f5f7',
            2: '#e8e8ed',
            3: '#d2d2d7',
            4: '#86868b',
            5: '#6e6e73',
            6: '#1d1d1f',
          },
          blue: '#0071e3',
          green: '#34c759',
          red: '#ff3b30',
          orange: '#ff9500',
          yellow: '#ffcc00',
          purple: '#af52de',
          pink: '#ff2d55',
          teal: '#5ac8fa',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['64px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-2': ['44px', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline': ['28px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title-1': ['24px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-2': ['19px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-3': ['16px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-large': ['16px', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body': ['15px', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
        'mini': ['11px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '500' }],
      },
      borderRadius: {
        'apple-sm': '8px',
        'apple': '12px',
        'apple-lg': '14px',
        'apple-xl': '18px',
        'apple-2xl': '22px',
        'apple-3xl': '30px',
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0,0,0,0.08)',
        'apple': '0 2px 8px rgba(0,0,0,0.08)',
        'apple-md': '0 4px 16px rgba(0,0,0,0.08)',
        'apple-lg': '0 8px 32px rgba(0,0,0,0.08)',
        'apple-xl': '0 16px 48px rgba(0,0,0,0.12)',
        'apple-glow': '0 0 40px rgba(0,113,227,0.15)',
        'apple-card': '0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'apple-card-hover': '0 12px 40px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        'apple': '20px',
      },
    },
  },
  plugins: [],
}
