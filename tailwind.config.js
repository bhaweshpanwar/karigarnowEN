/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // High-end Stone/Neutral palette
        ink:     '#0c0a09', // Stone 950
        ink2:    '#292524', // Stone 800
        mid:     '#57534e', // Stone 600
        muted:   '#a8a29e', // Stone 400
        rule:    '#e7e5e4', // Stone 200
        rule2:   '#f5f5f4', // Stone 100
        
        // Backgrounds
        bg:      '#fafaf9', // Stone 50 (Warm Off-white)
        bg2:     '#f5f5f4', // Stone 100
        bg3:     '#e7e5e4', // Stone 200
        
        // Brand Accent: Deep Forest / Emerald
        accent:  '#064e3b', // Emerald 900
        accent2: '#10b981', // Emerald 500
        accent3: '#34d399', // Emerald 400
        ap:      '#ecfdf5', // Emerald 50
        ap2:     '#d1fae5', // Emerald 100
        
        // Semantic Colors
        green:   '#065f46',
        gbg:     '#f0fdf4',
        red:     '#991b1b',
        rbg:     '#fef2f2',
        gold:    '#854d0e',
        goldbg:  '#fefce8',
        blue:    '#1e40af',
        bluebg:  '#eff6ff',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans:    ['Instrument Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
