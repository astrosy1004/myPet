"use client";

import { useState } from "react";

const STORAGE_KEY = "myPet-theme";
type Theme = "default" | "cute";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "default";
  return document.documentElement.getAttribute("data-theme") === "cute"
    ? "cute"
    : "default";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggle() {
    const next: Theme = theme === "cute" ? "default" : "cute";
    setTheme(next);

    if (next === "cute") {
      document.documentElement.setAttribute("data-theme", "cute");
    } else {
      document.documentElement.removeAttribute("data-theme");
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
      className="fixed right-4 bottom-4 z-50 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-lg ring-1 ring-zinc-200 transition hover:scale-105"
    >
      {theme === "cute" ? "🎨 기본 테마" : "🐰 귀여운 테마"}
    </button>
  );
}
