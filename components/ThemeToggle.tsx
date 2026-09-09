"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Comuta la mod luminos" : "Comuta la mod intunecat"}
      className="flex shrink-0 items-center justify-center rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
