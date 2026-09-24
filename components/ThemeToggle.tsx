"use client";

import { useEffect, useState } from "react";

type ThemeMode = "auto" | "light" | "dark";

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cn-free-theme") as ThemeMode | null;
      if (saved && ["auto", "light", "dark"].includes(saved)) {
        setMode(saved);
        applyTheme(saved);
      } else {
        applyTheme("auto");
      }
    } catch {
      applyTheme("auto");
    }
  }, []);

  const applyTheme = (targetMode: ThemeMode) => {
    const root = document.documentElement;
    if (targetMode === "auto") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", targetMode);
    }
    root.setAttribute("data-theme-mode", targetMode);
  };

  const handleSelect = (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      localStorage.setItem("cn-free-theme", newMode);
    } catch {}
    applyTheme(newMode);
  };

  return (
    <div className="flex items-center rounded-lg bg-surface-hover p-1 text-xs font-medium text-ink-600 border border-surface-border">
      <button
        type="button"
        onClick={() => handleSelect("light")}
        className={`flex items-center gap-1 rounded px-2 py-1 transition-all ${
          mode === "light"
            ? "bg-surface-card text-brand-accent shadow-sm font-semibold"
            : "hover:text-ink-900"
        }`}
        title="浅色模式"
      >
        <span>☀️</span>
        <span className="hidden sm:inline">浅色</span>
      </button>
      <button
        type="button"
        onClick={() => handleSelect("dark")}
        className={`flex items-center gap-1 rounded px-2 py-1 transition-all ${
          mode === "dark"
            ? "bg-surface-card text-brand-accent shadow-sm font-semibold"
            : "hover:text-ink-900"
        }`}
        title="深色模式"
      >
        <span>🌙</span>
        <span className="hidden sm:inline">深色</span>
      </button>
      <button
        type="button"
        onClick={() => handleSelect("auto")}
        className={`flex items-center gap-1 rounded px-2 py-1 transition-all ${
          mode === "auto"
            ? "bg-surface-card text-brand-accent shadow-sm font-semibold"
            : "hover:text-ink-900"
        }`}
        title="跟随系统"
      >
        <span>🖥️</span>
        <span className="hidden sm:inline">跟随</span>
      </button>
    </div>
  );
}
