import claymorphism from 'tailwindcss-claymorphism';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        farmGreen: 'hsl(142, 71%, 45%)',
        skyBlue: 'hsl(200, 100%, 50%)',
        clayBg: 'hsl(0, 0%, 98%)'
      },
      borderRadius: {
        clay: '50px'
      },
      boxShadow: {
        'clay-card':
          '16px 16px 32px hsla(0,0%,0%,.2), -16px -16px 32px hsla(0,0%,100%,.8)',
        'clay-btn':
          '8px 8px 16px hsla(0,0%,0%,.3), inset -4px -4px 8px hsla(0,0%,100%,.8)'
      },
      backdropBlur: {
        xl: '24px'
      }
    }
  },
  plugins: [claymorphism]
};
