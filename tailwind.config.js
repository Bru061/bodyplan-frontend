export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a",
        primaryHover: "#071950",
        surface: "#ffffff",
        bg: "#f8fafc",
      },
      borderRadius: {
        xl2: "14px",
      },
      boxShadow: {
        soft: "0 8px 18px rgba(15, 23, 42, 0.08)",
      }
    },
  },
  plugins: [],
}