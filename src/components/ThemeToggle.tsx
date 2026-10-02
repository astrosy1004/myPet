"use client";

import { useState } from "react";

const STORAGE_KEY = "myPet-theme";
type Theme = "default" | "dark" | "cute";

const NEXT: Record<Theme, Theme> = {
  default: "dark",
  dark: "cute",
  cute: "default",
};

const THEME_LABELS: Record<Theme, string> = {
  default: "🎨 기본 테마",
  dark: "🌙 다크 테마",
  cute: "🐰 귀여운 테마",
};

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "default";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" || attr === "cute" ? attr : "default";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggle() {
    const next = NEXT[theme];
    setTheme(next);

    if (next === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", next);
    }

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage 접근 불가 시 무시 (테마는 이번 세션에서만 유지)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      className="fixed right-4 bottom-20 z-50 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-lg ring-1 ring-zinc-200 transition hover:scale-105"
    >
      {THEME_LABELS[NEXT[theme]]}
    </button>
  );
}
