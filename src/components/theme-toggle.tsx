"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

import { cn } from "@/lib/cn";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return true;
  }

  const saved = window.localStorage.getItem("ace-theme");
  return saved ? saved === "dark" : true;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("ace-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setDark((current) => !current)}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:bg-white/15 dark:text-slate-100",
        "not-dark:border-slate-200 not-dark:bg-white not-dark:text-slate-900",
        className
      )}
    >
      {dark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
    </button>
  );
}
