import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        tv:  '1600px',
        fhd: '1920px',
        qhd: '2560px',
        uhd: '3840px',
      }
    }
  },
  plugins: [],
} satisfies Config
