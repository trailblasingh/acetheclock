import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Analytics Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-white not-dark:text-slate-950">Performance under pressure</h1>
        <p className="mt-3 max-w-3xl text-slate-300 not-dark:text-slate-600">
          Track score, accuracy, attempt volume, and test history. The data model is structured to expand into weak
          topic detection and time-per-question analysis.
        </p>
      </section>
      <DashboardClient />
    </div>
  );
}
