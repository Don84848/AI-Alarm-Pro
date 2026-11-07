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
        // Material You (M3) Dark Theme Palette
        m3: {
          surface: '#111318',
          surfaceLow: '#1a1c22',
          surfaceContainer: '#202228',
          surfaceHigh: '#272930',
          surfaceHighest: '#32343c',
          outline: '#44474f',
          outlineVariant: '#31333a',
          primary: '#a8c7fa',
          onPrimary: '#062e6f',
          primaryContainer: '#0842a0',
          onPrimaryContainer: '#d3e3fd',
          secondary: '#c3c6cf',
          secondaryContainer: '#3f4753',
          tertiary: '#c4e7ff',
          error: '#f2b8b5',
          onError: '#601410',
          textPrimary: '#e2e2e9',
          textSecondary: '#c4c6d0',
          textTertiary: '#8e9099',
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
