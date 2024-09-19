/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main palette
        background: '#16161a',
        headline: '#fffffe',
        paragraph: '#94a1b2',
        button: '#7f5af0',
        'button-text': '#fffffe',
        'background-dark': '#16161a',

        // Illustration colors
        stroke: '#010101',
        main: '#fffffe',
        highlight: '#7f5af0',
        secondary: '#72757e',
        tertiary: '#2cb67d',

        // You can also create shades of these colors
        purple: {
          DEFAULT: '#7f5af0',
          light: '#9d7ef2',
          dark: '#6437ed',
        },
        green: {
          DEFAULT: '#2cb67d',
          light: '#41d492',
          dark: '#239d68',
        },
        gray: {
          DEFAULT: '#72757e',
          light: '#94a1b2',
          dark: '#4f5259',
        },
      },
    },
    // Optionally, you can override the default font family
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      guerilla: ['Protest Guerrilla', 'sans-serif']
    },
  },
}

