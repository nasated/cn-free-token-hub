import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // aihot 风格：纸质暖白与深冷墨黑
        brand: {
          accent: "#d97706", // 琥珀暖金
          hover: "#b45309",
          light: "#fef3c7",
          dark: "#78350f",
        },
        ink: {
          950: "var(--ink-950)",
          900: "var(--ink-900)",
          800: "var(--ink-800)",
          700: "var(--ink-700)",
          600: "var(--ink-600)",
          500: "var(--ink-500)",
          400: "var(--ink-400)",
          300: "var(--ink-300)",
          200: "var(--ink-200)",
          100: "var(--ink-100)",
          50: "var(--ink-50)",
        },
        surface: {
          base: "var(--bg-base)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
          border: "var(--border-color)",
        },
        free: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          600: "#059669",
        },
        warn: {
          DEFAULT: "#ef4444",
          50: "#fef2f2",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;