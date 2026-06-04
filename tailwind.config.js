/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4A',
          light: '#243561',
          dark: '#111d33'
        },
        gold: {
          DEFAULT: '#D4A017',
          light: '#E8B832',
          dark: '#A87D10'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
