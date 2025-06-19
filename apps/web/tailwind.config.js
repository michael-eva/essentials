/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-sans)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-mono)', 'monospace'],
        'heading': ['var(--font-heading)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Essentials Studio Brand Colors
        brand: {
          'warm-brown': 'hsl(var(--brand-warm-brown))',
          'deep-blue': 'hsl(var(--brand-deep-blue))',
          'amber': 'hsl(var(--brand-amber))',
          'sand': 'hsl(var(--brand-sand))',
          'warm-brown-light': 'hsl(var(--brand-warm-brown-light))',
          'warm-brown-dark': 'hsl(var(--brand-warm-brown-dark))',
          'neutral': 'hsl(var(--brand-neutral))',
          'neutral-light': 'hsl(var(--brand-neutral-light))',
        },
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'blob': 'blob 7s infinite',
        'gentle-fade-in': 'gentle-fade-in 0.6s ease-out',
        'warm-glow': 'warm-glow 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        'gentle-fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'warm-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 5px hsl(var(--brand-amber) / 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 20px hsl(var(--brand-amber) / 0.3)',
          },
        },
      },
      boxShadow: {
        'warm': '0 4px 6px -1px hsl(var(--brand-warm-brown) / 0.1), 0 2px 4px -1px hsl(var(--brand-warm-brown) / 0.06)',
        'warm-lg': '0 10px 15px -3px hsl(var(--brand-warm-brown) / 0.1), 0 4px 6px -2px hsl(var(--brand-warm-brown) / 0.05)',
      },
    },
  },
  plugins: [],
}
