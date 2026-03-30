"use client";

import { useState } from "react";
import Link from "next/link";
import { LockKeyhole, Sparkles } from "lucide-react";

import type { TestRecord } from "@/lib/types";

type TopicCard = {
  slug: string;
  name: string;
  isFree: boolean;
  testCount: number;
  totalQuestions: number;
};

function getPremiumState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("is_premium") === "true";
}

export function TopicsClient({ topics, tests }: { topics: TopicCard[]; tests: TestRecord[] }) {
  const [isPremium] = useState(getPremiumState);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Topic Library</p>
        <h1 className="mt-3 text-3xl font-semibold text-white not-dark:text-slate-950">Choose your mock battlefield</h1>
        <p className="mt-3 max-w-3xl text-slate-300 not-dark:text-slate-600">
          Percentages is free. Every other topic unlocks after the ₹129 Razorpay payment completes.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {topics.map((topic) => {
          const topicTests = tests.filter((test) => test.topicSlug === topic.slug);
          const isLocked = !topic.isFree && !isPremium;

          return (
            <section
              key={topic.slug}
              className="rounded-[32px] border border-white/10 bg-white/5 p-6 not-dark:border-slate-200 not-dark:bg-white/85"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300 not-dark:border-slate-200 not-dark:text-slate-700">
                    {topic.isFree ? <Sparkles className="h-4 w-4 text-emerald-400" /> : <LockKeyhole className="h-4 w-4 text-amber-400" />}
                    {topic.isFree ? "Free topic" : isLocked ? "Locked" : "Premium unlocked"}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-white not-dark:text-slate-950">{topic.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {topic.testCount} tests and {topic.totalQuestions} questions
                  </p>
                </div>
                {!topic.isFree ? (
                  <Link
                    href={isLocked ? "/payment" : "/topics"}
                    className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 not-dark:text-amber-700"
                  >
                    {isLocked ? "Unlock" : "Unlocked"}
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 space-y-3">
                {topicTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/50 p-4 not-dark:border-slate-200 not-dark:bg-slate-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-white not-dark:text-slate-950">{test.name}</h3>
                      <p className="text-sm text-slate-400">
                        {test.questions.length} questions and {test.durationMinutes} minutes
                      </p>
                    </div>
                    <Link
                      href={isLocked ? "/payment" : `/test/${test.id}`}
                      className="rounded-full bg-indigo-500 px-5 py-3 text-center font-medium text-white transition hover:bg-indigo-400"
                    >
                      {isLocked ? "Go to payment" : "Start test"}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}