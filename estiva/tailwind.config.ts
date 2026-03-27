import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        estiva: {
          mint: "#6DC3BB",
          navy: "#393D7E",
          purple: "#5459AC",
          pink: "#F2AEBB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
