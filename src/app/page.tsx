import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BrainCircuit, ChartColumnIncreasing, ShieldCheck } from "lucide-react";

import { getTopics } from "@/lib/catalog";
import MockSection from "@/components/mock-section";

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

      <MockSection />

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

        <div className="rounded-2xl bg-gradient-to-br from-indigo-100 via-white to-green-100 p-5 shadow-sm border border-gray-100">

          <div className="text-xs tracking-widest text-gray-500 mb-3 text-center">
            FOUNDER SPOTLIGHT
          </div>

        {/* IMAGE */}

          <div className="flex justify-center mb-3">
            <Image
              src="/VikashProfile.jpeg"
              alt="Vikash Singh"
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>

        {/* NAME */}

          <h3 className="text-base font-bold text-gray-900 text-center">
            Vikash Singh
          </h3>

        {/* TAGLINE */}

          <p className="text-[11px] text-indigo-600 font-semibold text-center">
            CAT 99+ %iler (QA) | IIM Bangalore
          </p>

        {/* ROLES */}

          <p className="text-[11px] text-gray-700 text-center mt-1">
            Academic Head – Quant | Founder – Profitequations
          </p>

        {/* BADGE */}

          <div className="flex justify-center mt-2">
            <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full">
              10,000+ Students Mentored
            </span>
          </div>

        {/* DESCRIPTION */}

          <p className="text-[11px] text-gray-600 leading-relaxed text-center mt-2">
            14+ years of teaching experience. Mentored 10,000+ CAT aspirants with multiple IIM converts.
          </p>

        </div>
      </section>

      <section>
        <h1 className="text-center text-4xl font-bold mb-12 mt-20 text-white not-dark:text-gray-900">
          Meet the Founder
        </h1>

        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* IMAGE */}
            <div className="flex justify-center">
              <Image
                src="/VikashProfile.jpeg"
                alt="Vikash Singh"
                width={260}
                height={260}
                className="rounded-2xl shadow-lg object-cover"
              />
            </div>

            {/* CONTENT */}
            <div>
              <h2 className="text-3xl font-bold text-white not-dark:text-gray-900 mb-3">
                Vikash Singh
              </h2>

              <p className="text-sm text-indigo-400 not-dark:text-indigo-600 font-semibold mb-4">
                CAT Serial 99%iler (QA) | IIM Bangalore Alumnus
              </p>

              <p className="text-sm text-slate-300 not-dark:text-gray-700 mb-4 font-medium">
                Academic Head – Quantitative Aptitude | Founder – Profitequations | School of Decision Making and Logical Thinking
              </p>

              <p className="text-slate-400 not-dark:text-gray-600 leading-relaxed">
                Vikash Singh is a serial CAT 99+ percentiler (QA), educator and IIM Bangalore alumnus with 14+ years of experience in quantitative aptitude, logical reasoning, and applied finance education. He has mentored 10,000+ CAT aspirants, many of whom have secured calls and conversions at IIMs and top B-schools.
              </p>
            </div>
          </div>
        </div>
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
