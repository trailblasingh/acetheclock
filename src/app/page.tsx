import Link from "next/link";
import { ArrowRight, BrainCircuit, ChartColumnIncreasing, ShieldCheck } from "lucide-react";

import { getTopics } from "@/lib/catalog";

export default function HomePage() {
  const topics = getTopics();

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white/85 sm:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300 not-dark:text-indigo-600">Premium CAT Prep</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white not-dark:text-slate-950 sm:text-6xl">
            AceTheClock - Master Quant Under Pressure
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 not-dark:text-slate-600">
            Build real exam composure with topic-wise mocks, CAT-style navigation, answer analytics, and an ingestion
            engine that transforms question PDFs plus solution PDFs into structured test data.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 font-medium text-white transition hover:bg-indigo-400"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/payment"
              className="rounded-full border border-white/10 px-6 py-3 font-medium text-slate-200 transition hover:bg-white/5 not-dark:border-slate-200 not-dark:text-slate-700"
            >
              Unlock Premium
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <FeatureCard
            icon={<BrainCircuit className="h-5 w-5" />}
            title="AI-ready ingestion"
            description="Question PDFs and solution PDFs are paired, parsed, normalized, and seeded into the catalog."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Real exam conditions"
            description="Timer, palette states, review flows, and negative marking mirror the CAT decision environment."
          />
          <FeatureCard
            icon={<ChartColumnIncreasing className="h-5 w-5" />}
            title="Analytics after every attempt"
            description="Score, accuracy, attempted/unattempted splits, and dashboard history are built into the flow."
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 not-dark:border-slate-200 not-dark:bg-white/80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Topics Grid</p>
              <h2 className="mt-2 text-2xl font-semibold text-white not-dark:text-slate-950">Quant topics in the pipeline</h2>
            </div>
            <Link href="/topics" className="text-sm font-medium text-indigo-300 not-dark:text-indigo-600">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.slug}
                className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 not-dark:border-slate-200 not-dark:bg-slate-50"
              >
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                  {topic.isFree ? "Free" : "Premium"}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white not-dark:text-slate-950">{topic.name}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {topic.testCount} tests and {topic.totalQuestions} questions
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 not-dark:border-slate-200 not-dark:bg-white/85">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Founder Spotlight</p>
          <div className="mt-5 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(79,70,229,0.28),rgba(34,197,94,0.22))] p-5 not-dark:border-slate-200">
            <div className="h-28 rounded-[24px] bg-white/10" />
            <h3 className="mt-5 text-xl font-semibold text-white not-dark:text-slate-950">Founder name placeholder</h3>
            <p className="mt-3 text-sm text-slate-300 not-dark:text-slate-600">
              Add the founder story, image, and pedagogy note here. This panel is ready for a real image and brand copy.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 not-dark:border-slate-200 not-dark:bg-white/80">
      <div className="inline-flex rounded-2xl bg-indigo-500/15 p-3 text-indigo-200 not-dark:text-indigo-700">{icon}</div>
      <h3 className="mt-5 text-xl font-semibold text-white not-dark:text-slate-950">{title}</h3>
      <p className="mt-3 text-slate-300 not-dark:text-slate-600">{description}</p>
    </div>
  );
}
