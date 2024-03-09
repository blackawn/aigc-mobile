/** @types {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: true
  },
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        ss: ['0.65rem', {
          lineHeight: '1rem',
        }]
      },
      colors:{
        primary: '#165DFF'
      },
    }
  },
  plugins: []
}