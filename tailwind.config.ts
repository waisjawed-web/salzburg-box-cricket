import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#07110b",
        turf: "#14b85a",
        lime: "#bef264",
        boundary: "#1f3327",
        floodlight: "#f8fafc"
      },
      boxShadow: {
        glow: "0 0 35px rgba(20, 184, 90, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
