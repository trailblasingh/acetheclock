"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BarChart3, CheckCircle2, ChevronDown, Clock3, Target, XCircle } from "lucide-react";

import { MathText } from "@/components/math-text";
import type { AttemptReviewRecord, QuestionRecord } from "@/lib/types";

const metricClass =
  "rounded-[28px] border border-white/10 bg-white/5 p-5 not-dark:border-slate-200 not-dark:bg-white";

type ReviewPayload = {
  id: string;
  name: string;
  questions: QuestionRecord[];
};

type InsightCard = {
  title: string;
  description: string;
  tone: "indigo" | "emerald" | "amber" | "rose" | "slate";
};

function getStoredAttempt(attemptId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(`ace-the-clock:attempt:${attemptId}`);
  return stored ? (JSON.parse(stored) as AttemptReviewRecord) : null;
}

export function ResultSummary({ attemptId }: { attemptId: string }) {
  const [attempt] = useState<AttemptReviewRecord | null>(() => getStoredAttempt(attemptId));
  const [review, setReview] = useState<ReviewPayload | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    if (!attempt) {
      return;
    }

    let active = true;

    void (async () => {
      const response = await fetch(`/api/tests/${attempt.testId}`);
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as ReviewPayload;
      if (active) {
        setReview(payload);
      }
    })();

    return () => {
      active = false;
    };
  }, [attempt]);

  const insights = useMemo(() => {
    if (!attempt || !review) {
      return [] as InsightCard[];
    }

    const attemptedRate = review.questions.length === 0 ? 0 : (attempt.attemptedCount / review.questions.length) * 100;
    const strategyInsight: InsightCard = {
      title: "Attempt Strategy",
      description:
        attemptedRate > 85
          ? `Too aggressive: you attempted ${attemptedRate.toFixed(0)}% of the paper. Tighten question selection.`
          : attemptedRate < 60
            ? `Too conservative: you attempted ${attemptedRate.toFixed(0)}% of the paper. Push more winnable sets.`
            : `Balanced attempt volume at ${attemptedRate.toFixed(0)}%. Keep refining selection quality.`,
      tone: attemptedRate > 85 ? "amber" : attemptedRate < 60 ? "rose" : "emerald"
    };

    const accuracyInsight: InsightCard = {
      title: "Accuracy Insight",
      description:
        attempt.accuracy < 60
          ? "Low accuracy, focus on basics and avoid forcing medium-confidence questions."
          : attempt.accuracy <= 80
            ? "Moderate accuracy. You are in range, but selection discipline can still raise score."
            : "Strong accuracy. Your conversion is solid and worth preserving under pressure.",
      tone: attempt.accuracy < 60 ? "rose" : attempt.accuracy <= 80 ? "amber" : "emerald"
    };

    const topTimeResponses = [...attempt.responses]
      .sort((left, right) => right.timeSpentSeconds - left.timeSpentSeconds)
      .slice(0, 3);

    const timeInsightDescription = topTimeResponses.length > 0
      ? topTimeResponses.map((response) => {
          const question = review.questions.find((item) => item.id === response.questionId);
          const questionLabel = question ? `Q${question.questionNumber}` : `Q?`;
          return `${questionLabel} \u2192 ${Math.ceil(response.timeSpentSeconds / 60)} min`;
        }).join("\n")
      : "Great pacing, no significant time sinks detected.";

    const timeInsight: InsightCard = {
      title: "Time Sinks",
      description: timeInsightDescription,
      tone: "indigo" as const
    };

    const mistakeInsight: InsightCard = {
      title: "Mistake Insight",
      description: `You made ${attempt.incorrectCount} mistake${attempt.incorrectCount === 1 ? "" : "s"}. Review error patterns before the next mock.`,
      tone: attempt.incorrectCount > 5 ? "rose" : "slate"
    };

    return [strategyInsight, accuracyInsight, timeInsight, mistakeInsight];
  }, [attempt, review]);

  if (!attempt) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-8 text-slate-300 not-dark:border-slate-200 not-dark:text-slate-700">
        Result snapshot not found in browser storage. Retake a test to generate a fresh attempt summary.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{attempt.topic}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white not-dark:text-slate-950">{attempt.testName}</h1>
        <p className="mt-3 max-w-2xl text-slate-300 not-dark:text-slate-600">
          Your attempt has been scored using CAT-style marking: +3 for correct answers, -1 for incorrect MCQs,
          and 0 for incorrect TITA responses.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<Target className="h-5 w-5" />} label="Score" value={String(attempt.score)} />
        <Metric icon={<BarChart3 className="h-5 w-5" />} label="Accuracy" value={`${attempt.accuracy}%`} />
        <Metric icon={<CheckCircle2 className="h-5 w-5" />} label="Correct" value={String(attempt.correctCount)} />
        <Metric icon={<XCircle className="h-5 w-5" />} label="Incorrect" value={String(attempt.incorrectCount)} />
        <Metric
          icon={<Clock3 className="h-5 w-5" />}
          label="Time Taken"
          value={`${Math.ceil(attempt.timeTakenSeconds / 60)} min`}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className={metricClass}>
          <h2 className="text-xl font-semibold text-white not-dark:text-slate-950">Attempt Diagnostics</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/60 p-4 not-dark:bg-slate-50">
              <p className="text-sm text-slate-400">Attempted</p>
              <p className="mt-2 text-3xl font-semibold text-white not-dark:text-slate-950">{attempt.attemptedCount}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/60 p-4 not-dark:bg-slate-50">
              <p className="text-sm text-slate-400">Unattempted</p>
              <p className="mt-2 text-3xl font-semibold text-white not-dark:text-slate-950">{attempt.unattemptedCount}</p>
            </div>
          </div>
        </div>

        <div className={metricClass}>
          <h2 className="text-xl font-semibold text-white not-dark:text-slate-950">Next Move</h2>
          <p className="mt-4 text-slate-300 not-dark:text-slate-600">
            Revisit low-confidence questions and compare your path with the official explanation. This review panel is
            designed to feel like mock analysis, not a lightweight quiz recap.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/topics"
              className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400"
            >
              Choose another test
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/5 not-dark:border-slate-200 not-dark:text-slate-700"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-indigo-300 not-dark:text-indigo-700" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Performance Insights</p>
            <h2 className="mt-1 text-2xl font-semibold text-white not-dark:text-slate-950">What your attempt pattern says</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {insights.map((insight) => (
            <InsightCardView key={`${insight.title}-${insight.description}`} insight={insight} />
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Question Review</p>
            <h2 className="mt-2 text-2xl font-semibold text-white not-dark:text-slate-950">CAT-style post-test analysis</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowSolutions((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 not-dark:border-slate-200 not-dark:text-slate-700"
          >
            {showSolutions ? "Hide Solutions" : "Show Solutions"}
            <ChevronDown className={`h-4 w-4 transition ${showSolutions ? "rotate-180" : "rotate-0"}`} />
          </button>
        </div>

        <QuestionReviewSection attempt={attempt} review={review} showSolutions={showSolutions} />
      </section>
    </div>
  );
}

function QuestionReviewSection({
  attempt,
  review,
  showSolutions
}: {
  attempt: AttemptReviewRecord;
  review: ReviewPayload | null;
  showSolutions: boolean;
}) {
  const responseMap = useMemo(
    () => new Map(attempt.responses.map((response) => [response.questionId, response])),
    [attempt.responses]
  );

  if (!review) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-white/10 p-6 text-slate-300 not-dark:border-slate-200 not-dark:text-slate-700">
        Loading reviewed questions, answers, and explanations...
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      {review.questions.map((question) => {
        const response = responseMap.get(question.id);
        const selectedAnswer = response?.selectedAnswer?.trim() ?? "";
        const isUnattempted = !selectedAnswer;
        const actualCorrectAnswer = question.correct_answer_override ?? question.correctAnswer;
        const isCorrect =
          !isUnattempted &&
          (question.type === "MCQ"
            ? selectedAnswer === String(actualCorrectAnswer)
            : Math.abs(Number(selectedAnswer) - Number(actualCorrectAnswer)) < 1e-6);
        const statusLabel = isUnattempted ? "Unattempted" : isCorrect ? "Correct" : "Incorrect";
        const statusClass = isUnattempted
          ? "bg-slate-500/15 text-slate-300 not-dark:bg-slate-100 not-dark:text-slate-700"
          : isCorrect
            ? "bg-emerald-500/15 text-emerald-300 not-dark:bg-emerald-100 not-dark:text-emerald-700"
            : "bg-rose-500/15 text-rose-300 not-dark:bg-rose-100 not-dark:text-rose-700";

        return (
          <article
            key={question.id}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 not-dark:border-slate-200 not-dark:bg-slate-50"
          >
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 not-dark:border-slate-200 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Question {question.questionNumber}</p>
                <p className="text-sm text-slate-400">Type: {question.type}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClass}`}>
                {statusLabel}
              </span>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <MathText text={question.question} className="text-slate-100 not-dark:text-slate-900" />
              </div>

              {question.type === "MCQ" ? (
                <div className="grid gap-3">
                  {question.options.map((option, index) => {
                    const label = String(index + 1);
                    const isSelected = selectedAnswer === label;
                    const isCorrectOption = String(actualCorrectAnswer) === label;
                    const optionClass = isCorrectOption
                      ? "border-emerald-400/40 bg-emerald-500/10"
                      : isSelected
                        ? "border-rose-400/40 bg-rose-500/10"
                        : "border-white/10 bg-slate-950/40 not-dark:border-slate-200 not-dark:bg-white";

                    return (
                      <div key={`${question.id}-${label}`} className={`rounded-2xl border p-4 ${optionClass}`}>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-slate-300 not-dark:text-slate-700">Option {label}</p>
                          <div className="flex gap-2 text-xs">
                            {isSelected ? <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-indigo-200 not-dark:text-indigo-700">Your choice</span> : null}
                            {isCorrectOption ? <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-200 not-dark:text-emerald-700">Correct</span> : null}
                          </div>
                        </div>
                        <MathText text={option} className="mt-2 text-slate-100 not-dark:text-slate-900" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <AnswerBox label="User Answer" value={selectedAnswer || "Not attempted"} />
                  <AnswerBox label="Correct Answer" value={String(actualCorrectAnswer)} />
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                <AnswerBox label="User Answer" value={question.type === "MCQ" ? formatMcqAnswer(question, selectedAnswer, true) : selectedAnswer || "Not attempted"} />
                <AnswerBox label="Correct Answer" value={question.type === "MCQ" ? formatMcqAnswer(question, String(actualCorrectAnswer), false) : String(actualCorrectAnswer)} />
                <AnswerBox label="Status" value={statusLabel} />
              </div>

              {showSolutions ? (
                <div className="rounded-3xl border border-indigo-400/20 bg-indigo-500/5 p-5">
                  <p className="mb-3 text-sm uppercase tracking-[0.25em] text-indigo-200 not-dark:text-indigo-700">Explanation</p>
                  <pre style={{ whiteSpace: "pre-wrap" }} className="font-sans text-base leading-relaxed text-slate-100 not-dark:text-slate-900">
                    {question.explanation}
                  </pre>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InsightCardView({ insight }: { insight: InsightCard }) {
  const toneClasses = {
    indigo: "border-indigo-400/20 bg-indigo-500/10 text-indigo-100 not-dark:bg-indigo-50 not-dark:text-indigo-800",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100 not-dark:bg-emerald-50 not-dark:text-emerald-800",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-100 not-dark:bg-amber-50 not-dark:text-amber-800",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-100 not-dark:bg-rose-50 not-dark:text-rose-800",
    slate: "border-slate-400/20 bg-slate-500/10 text-slate-100 not-dark:bg-slate-100 not-dark:text-slate-800"
  } as const;

  return (
    <div className={`rounded-[28px] border p-5 ${toneClasses[insight.tone]}`}>
      <p className="text-sm uppercase tracking-[0.25em] opacity-80">{insight.title}</p>
      <p className="mt-3 whitespace-pre-line text-base font-medium leading-7">{insight.description}</p>
    </div>
  );
}

function AnswerBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 not-dark:border-slate-200 not-dark:bg-white">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 font-medium text-white not-dark:text-slate-950">{value}</p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={metricClass}>
      <div className="flex items-center gap-2 text-indigo-300 not-dark:text-indigo-600">{icon}</div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white not-dark:text-slate-950">{value}</p>
    </div>
  );
}

function formatMcqAnswer(question: QuestionRecord, answer: string, allowEmpty: boolean) {
  if (!answer) {
    return allowEmpty ? "Not attempted" : "";
  }

  const option = question.options[Number(answer) - 1];
  return option ? `Option ${answer}: ${option}` : answer;
}

function normalize(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}