import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#243044",
        berry: "#397b68",
        mango: "#c88a3d",
        mint: "#6c9d78",
        paper: "#fffdf9"
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Sinhala", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
