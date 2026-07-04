/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#050505',
          bgSecondary: '#0a0a0c',
          bgTertiary: '#121216',
          border: '#26262a',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          900: '#164e63',
          neon: '#00f0ff',
        },
        magenta: {
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          900: '#701a75',
          neon: '#ff00ff',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
        display: ['"Outfit"', '"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'glow-magenta': '0 0 15px rgba(255, 0, 255, 0.4)',
        'inked': '0 0 0 2px #050505, 4px 4px 0 0 #050505',
      },
      backgroundImage: {
        'anime-grid': "radial-gradient(circle, rgba(0, 240, 255, 0.1) 1px, transparent 1px)",
        'manga-dots': "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 0)",
      },
      animation: {
        'blob': "blob 7s infinite",
        'fade-in': 'fadeIn 0.3s ease-out',
        'p5-slash': 'p5Slash 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'p5-stamp': 'p5Stamp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        p5Slash: {
          '0%': { transform: 'translateX(-100%) skewX(-20deg)', opacity: '0' },
          '100%': { transform: 'translateX(0) skewX(-5deg)', opacity: '1' }
        },
        p5Stamp: {
          '0%': { transform: 'scale(5) rotate(15deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-5deg)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
