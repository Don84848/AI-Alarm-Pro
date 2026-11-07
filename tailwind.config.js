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
        // Material & Stock Light Theme Palette
        m3: {
          surface: '#FFFFFF',
          surfaceLow: '#F8F9FA',
          surfaceContainer: '#F1F3F5',
          surfaceHigh: '#E9ECEF',
          surfaceHighest: '#DEE2E6',
          outline: '#CED4DA',
          outlineVariant: '#E9ECEF',
          primary: '#2563EB',
          onPrimary: '#FFFFFF',
          primaryContainer: '#EFF6FF',
          onPrimaryContainer: '#1D4ED8',
          secondary: '#4B5563',
          secondaryContainer: '#F3F4F6',
          tertiary: '#0284C7',
          error: '#DC2626',
          onError: '#FFFFFF',
          textPrimary: '#111827',
          textSecondary: '#4B5563',
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
