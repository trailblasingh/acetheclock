import Link from "next/link";
import { Gauge, LockKeyhole, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.28),_transparent_42%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)] text-slate-100 transition-colors not-dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.14),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] not-dark:text-slate-950">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-40 mb-8 rounded-full border border-white/10 bg-slate-950/70 px-5 py-3 backdrop-blur-xl not-dark:border-slate-200 not-dark:bg-white/90">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-indigo-300 not-dark:text-indigo-600">
                  AceTheClock
                </p>
                <p className="text-xs text-slate-400">Mock pressure. Real outcomes.</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-slate-300 not-dark:text-slate-700 md:flex">
              <Link href="/topics">Topics</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/payment">Premium</Link>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 not-dark:text-emerald-700 sm:flex">
                <Sparkles className="h-4 w-4" />
                Free topic unlocked
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {children}

        <footer className="mt-16 rounded-[32px] border border-white/10 bg-slate-950/60 px-6 py-5 text-sm text-slate-400 not-dark:border-slate-200 not-dark:bg-white/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>AceTheClock is structured for CAT-style mock delivery, PDF ingestion, analytics, and premium topic unlocks.</p>
            <p className="inline-flex items-center gap-2">
              <LockKeyhole className="h-4 w-4" />
              Premium unlock: Rs. 129 for all locked topics
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
