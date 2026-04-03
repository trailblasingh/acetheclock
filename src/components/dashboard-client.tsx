"use client";

import { useState } from "react";
import Link from "next/link";

import type { AttemptSummary } from "@/lib/types";

function getStoredAttempts() {
  if (typeof window === "undefined") {
    return [] as AttemptSummary[];
  }

  const stored = window.localStorage.getItem("ace-the-clock:attempts");
  return stored ? (JSON.parse(stored) as AttemptSummary[]) : [];
}

export function DashboardClient() {
  const [attempts] = useState(getStoredAttempts);

  const totalAttempts = attempts.length;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((attempt: any) => attempt.score)) : 0;
  const averageAccuracy =
    attempts.length > 0
      ? (attempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / attempts.length).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Attempts" value={String(totalAttempts)} />
        <MetricCard label="Best Score" value={String(bestScore)} />
        <MetricCard label="Average Accuracy" value={`${averageAccuracy}%`} />
      </section>

      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Attempt History</p>
            <h2 className="mt-2 text-2xl font-semibold text-white not-dark:text-slate-950">Performance trend</h2>
          </div>
          <Link
            href="/topics"
            className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400"
          >
            Take another test
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {attempts.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-white/10 p-6 text-slate-300 not-dark:border-slate-200 not-dark:text-slate-700">
              No saved attempts yet. Submit a test to start building your analytics dashboard.
            </p>
          ) : (
            attempts.map((attempt: any) => (
              <div
                key={attempt.attemptId}
                className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[2fr_repeat(4,1fr)] not-dark:border-slate-200 not-dark:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-white not-dark:text-slate-950">{attempt.testName}</p>
                  <p className="text-sm text-slate-400">{attempt.topic}</p>
                </div>
                <Stat label="Score" value={String(attempt.score)} />
                <Stat label="Accuracy" value={`${attempt.accuracy}%`} />
                <Stat label="Attempted" value={String(attempt.attemptedCount)} />
                <Stat label="Time" value={`${Math.ceil(attempt.timeTakenSeconds / 60)} min`} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 not-dark:border-slate-200 not-dark:bg-white">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white not-dark:text-slate-950">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white not-dark:text-slate-950">{value}</p>
    </div>
  );
}
