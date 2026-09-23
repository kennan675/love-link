/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        background: "#171513",
        card: "#201c18",
        border: "#332c25",
        muted: "#29241f",
        foreground: "#f5f3ef",
        primary: {
          DEFAULT: "#C8102E",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#C8973A",
          foreground: "#171513",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(200, 151, 58, 0.25)",
        card: "0 8px 30px rgba(0, 0, 0, 0.4)",
        button: "0 4px 20px -2px rgba(200, 16, 46, 0.4)",
      },
    },
  },
  plugins: [],
};
