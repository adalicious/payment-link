/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    transitionDuration: {
        DEFAULT: '400ms',
    },
    extend: {
        colors: {
            txpink: '#DD62FD',
            txpink2: '#9E46B4',
            txblue: '#0AD0FF',
            txblue2: '#08AACF',
            accent1: '#0AD0FF',
            accent2: '#DD62FD',
            accent2light: '#E4A0F6',
            gray: {
                50: '#efefef',
                100: '#e6e6e6', // -10
                150: '#dddddd', // -10
                200: '#d4d4d4', // -10
                300: '#c1c1c1', // -20
                400: '#a0a0a0', // -35
                500: '#808080', // middle
                600: '#616161', // +35
                700: '#3e3e3e', // +20
                800: '#2b2b2b', // +10
                850: '#222222', // +10
                900: '#191919', // +10
                950: '#101010',
            },
        },
    },
},
plugins: [],
}
