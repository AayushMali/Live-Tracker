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
        ax: {
          bg: '#111522',
          secondary: '#191F30',
          card: '#20283D',
          border: '#2A3650',
          'border-light': '#364566',
          lime: '#9DDB00',
          orange: '#FF9B52',
          blue: '#5689FF',
          text: '#F4F6FB',
          muted: '#9CA8BD',
          dark: '#0D101B',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
