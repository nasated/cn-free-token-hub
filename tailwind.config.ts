import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 站点主色调：暖金（"额度/羊毛"主题），避免 aihot.news 那种纯黑白的冷感
        ink: {
          900: "#1a1a1a",
          800: "#242424",
          700: "#3a3a3a",
          600: "#5c5c5c",
          500: "#8a8a8a",
          400: "#b0b0b0",
          300: "#d4d4d4",
          200: "#e5e5e5",
          100: "#f0f0f0",
          50: "#fafaf8",
        },
        accent: {
          DEFAULT: "#ca8a04", // 暖金：额度、金币感
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#ca8a04",
          600: "#a16207",
          700: "#854d0e",
        },
        free: {
          DEFAULT: "#16a34a", // 有效额度
          50: "#f0fdf4",
          600: "#15803d",
        },
        warn: {
          DEFAULT: "#dc2626", // 已失效/需注意
          50: "#fef2f2",
          600: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ["system-ui", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;