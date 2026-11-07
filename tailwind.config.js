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
        // Stock ColorOS / Real Clock Theme Palette (Matching User Screenshots)
        m3: {
          surface: '#FFFFFF',
          surfaceLow: '#F9FAFB',
          surfaceContainer: '#F3F4F6',
          surfaceHigh: '#E5E7EB',
          surfaceHighest: '#D1D5DB',
          outline: '#E5E7EB',
          outlineVariant: '#F3F4F6',
          primary: '#00B074', // Stock Vibrant Green
          onPrimary: '#FFFFFF',
          primaryContainer: '#E8F8F2',
          onPrimaryContainer: '#008759',
          secondary: '#6B7280',
          secondaryContainer: '#F3F4F6',
          tertiary: '#00B074',
          error: '#EF4444',
          onError: '#FFFFFF',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
          textTertiary: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '28px',
      }
    },
  },
  plugins: [],
}
