/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          100: "#e6ecff",
          200: "#c6d1ff",
          300: "#a5b6ff",
          400: "#7b8dff",
          500: "#4f63f0",
          600: "#3c4ccc",
          700: "#2a37a8",
          800: "#1b247f",
          900: "#111659",
        },
        accent: {
          pink: "#ff7ac3",
          yellow: "#ffd166",
          teal: "#59c3c3",
        },
        surface: {
          DEFAULT: "#0f1624",
          muted: "#1c2436",
          highlight: "#273048",
        },
        footer: {
          background: "#080c16",
          border: "#1e2538",
          text: "#b7bfd9",
        },
        text: {
          primary: "#f4f5fa",
          secondary: "#c3c8de",
        },
      },
      fontFamily: {
        display: ["var(--font-pretendard)", "'Noto Sans TC'", "sans-serif"],
        body: ["var(--font-pretendard)", "'Noto Sans TC'", "sans-serif"],
        mono: ["'Space Grotesk'", "monospace"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      boxShadow: {
        card: "0 12px 30px rgba(15, 22, 36, 0.25)",
      },
    },
  },
  plugins: [],
};
