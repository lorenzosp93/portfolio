module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#FFF8EF",
        surface: "#FFFFFF",
        muted: "#64748B",
        teal: "#0F766E",
        tealSoft: "#CCFBF1",
        coral: "#F9735B",
        coralSoft: "#FFE1DA",
        amber: "#F4B740",
        amberSoft: "#FEF3C7",
        night: "#0B1120",
        nightSurface: "#111827",
      },
      scale: {
        102.5: "1.025",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};