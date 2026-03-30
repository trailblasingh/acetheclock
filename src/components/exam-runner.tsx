"use client";

import { useEffect, useEffectEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock3, Flag, RotateCcw } from "lucide-react";

import type { AttemptResponse, AttemptReviewRecord, TestRecord } from "@/lib/types";
import { cn } from "@/lib/cn";
import { MathText } from "@/components/math-text";

type ReviewState = "not_visited" | "not_answered" | "answered" | "marked";

type StoredState = {
  currentIndex: number;
  answers: Record<string, string>;
  marked: string[];
  visited: string[];
  timeSpent: Record<string, number>;
  remainingSeconds: number;
};

const storagePrefix = "ace-the-clock:test:";

function getDefaultState(test: TestRecord): StoredState {
  return {
    currentIndex: 0,
    answers: {},
    marked: [],
    visited: [test.questions[0]?.id ?? ""].filter(Boolean),
    timeSpent: {},
    remainingSeconds: test.durationMinutes * 60
  };
}

function getStoredState(test: TestRecord): StoredState {
  if (typeof window === "undefined") {
    return getDefaultState(test);
  }

  const persisted = window.localStorage.getItem(`${storagePrefix}${test.id}`);
  return persisted ? (JSON.parse(persisted) as StoredState) : getDefaultState(test);
}

export function ExamRunner({ test }: { test: TestRecord }) {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(() => getStoredState(test).currentIndex);
  const [answers, setAnswers] = useState<Record<string, string>>(() => getStoredState(test).answers);
  const [marked, setMarked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(getStoredState(test).marked.map((id) => [id, true]))
  );
  const [visited, setVisited] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(getStoredState(test).visited.map((id) => [id, true]))
  );
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>(() => getStoredState(test).timeSpent);
  const [remainingSeconds, setRemainingSeconds] = useState(() => getStoredState(test).remainingSeconds);

  const currentQuestion = test.questions[currentIndex];

  function buildResponses(): AttemptResponse[] {
    return test.questions.map((question) => ({
      questionId: question.id,
      selectedAnswer: answers[question.id] ?? "",
      timeSpentSeconds: timeSpent[question.id] ?? 0
    }));
  }

  function submitAttempt(secondsLeft = remainingSeconds) {
    const responses = buildResponses();
    const payload = {
      testId: test.id,
      timeTakenSeconds: test.durationMinutes * 60 - secondsLeft,
      responses
    };

    startTransition(async () => {
      const response = await fetch("/api/attempts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return;
      }

      const summary = await response.json();
      const result: AttemptReviewRecord = {
        ...summary,
        responses
      };

      window.localStorage.removeItem(`${storagePrefix}${test.id}`);
      window.localStorage.setItem(`ace-the-clock:attempt:${result.attemptId}`, JSON.stringify(result));

      const dashboardAttempts = JSON.parse(
        window.localStorage.getItem("ace-the-clock:attempts") ?? "[]"
      ) as object[];

      dashboardAttempts.unshift(summary);
      window.localStorage.setItem(
        "ace-the-clock:attempts",
        JSON.stringify(dashboardAttempts.slice(0, 25))
      );

      router.push(`/result/${result.attemptId}`);
    });
  }

  const autoSubmit = useEffectEvent(() => {
    submitAttempt(0);
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          autoSubmit();
          return 0;
        }

        return current - 1;
      });

      setTimeSpent((current) => ({
        ...current,
        [currentQuestion.id]: (current[currentQuestion.id] ?? 0) + 1
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentQuestion.id]);

  useEffect(() => {
    const state: StoredState = {
      currentIndex,
      answers,
      marked: Object.keys(marked).filter((id) => marked[id]),
      visited: Object.keys(visited).filter((id) => visited[id]),
      timeSpent,
      remainingSeconds
    };

    window.localStorage.setItem(`${storagePrefix}${test.id}`, JSON.stringify(state));
  }, [answers, currentIndex, marked, remainingSeconds, test.id, timeSpent, visited]);

  const statuses = useMemo(() => {
    return Object.fromEntries(
      test.questions.map((question) => {
        const wasVisited = visited[question.id];
        const hasAnswer = Boolean(answers[question.id]?.trim());
        const isMarked = Boolean(marked[question.id]);
        let state: ReviewState = "not_visited";

        if (isMarked) {
          state = "marked";
        } else if (hasAnswer) {
          state = "answered";
        } else if (wasVisited) {
          state = "not_answered";
        }

        return [question.id, state];
      })
    ) as Record<string, ReviewState>;
  }, [answers, marked, test.questions, visited]);

  function selectQuestion(index: number) {
    setCurrentIndex(index);
    setVisited((current) => ({ ...current, [test.questions[index].id]: true }));
  }

  function saveAndNext() {
    setMarked((current) => ({ ...current, [currentQuestion.id]: false }));
    if (currentIndex < test.questions.length - 1) {
      selectQuestion(currentIndex + 1);
    }
  }

  function markForReviewAndNext() {
    setMarked((current) => ({ ...current, [currentQuestion.id]: true }));
    if (currentIndex < test.questions.length - 1) {
      selectQuestion(currentIndex + 1);
    }
  }

  function clearResponse() {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: "" }));
    setMarked((current) => ({ ...current, [currentQuestion.id]: false }));
  }

  function getPaletteClasses(status: ReviewState) {
    switch (status) {
      case "answered":
        return "bg-emerald-500 text-white ring-emerald-300";
      case "marked":
        return "bg-amber-400 text-slate-950 ring-amber-200";
      case "not_answered":
        return "bg-rose-500 text-white ring-rose-200";
      default:
        return "bg-slate-700 text-slate-200 ring-slate-500 not-dark:bg-slate-200 not-dark:text-slate-700";
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 not-dark:border-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">CAT Simulation</p>
            <h1 className="text-2xl font-semibold text-white not-dark:text-slate-950">{test.name}</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-indigo-100 not-dark:border-indigo-200 not-dark:bg-indigo-50 not-dark:text-indigo-700">
            <Clock3 className="h-4 w-4" />
            <span className="font-medium">{formatTime(remainingSeconds)}</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Question {currentQuestion.questionNumber}</p>
              <p className="text-sm text-slate-400">
                Type: <span className="font-semibold text-slate-200 not-dark:text-slate-700">{currentQuestion.type}</span>
              </p>
            </div>
            {marked[currentQuestion.id] ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-sm text-amber-300 not-dark:bg-amber-100 not-dark:text-amber-700">
                <Flag className="h-4 w-4" />
                Marked for review
              </span>
            ) : null}
          </div>

          <MathText
            text={currentQuestion.question}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-100 not-dark:border-slate-200 not-dark:bg-slate-50 not-dark:text-slate-900"
          />

          {currentQuestion.type === "MCQ" ? (
            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const label = String(index + 1);
                const selected = answers[currentQuestion.id] === label || answers[currentQuestion.id] === option;

                return (
                  <label
                    key={`${currentQuestion.id}-${label}`}
                    className={cn(
                      "flex cursor-pointer gap-4 rounded-2xl border px-4 py-4 transition",
                      selected
                        ? "border-indigo-400 bg-indigo-500/10 text-white not-dark:bg-indigo-50 not-dark:text-indigo-900"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 not-dark:border-slate-200 not-dark:bg-white not-dark:text-slate-800"
                    )}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={label}
                      checked={selected}
                      onChange={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: label }))}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-400">{`Option ${label}`}</p>
                      <MathText text={option} />
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-300 not-dark:text-slate-700">
                Type In The Answer
              </label>
              <input
                value={answers[currentQuestion.id] ?? ""}
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [currentQuestion.id]: event.target.value }))
                }
                placeholder="Enter your answer"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-lg text-white outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400 not-dark:border-slate-200 not-dark:bg-white not-dark:text-slate-900"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveAndNext}
            className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400"
          >
            Save and Next
          </button>
          <button
            type="button"
            onClick={markForReviewAndNext}
            className="rounded-full border border-amber-400/40 bg-amber-400/10 px-5 py-3 font-medium text-amber-200 transition hover:bg-amber-400/20 not-dark:text-amber-700"
          >
            Mark for Review and Next
          </button>
          <button
            type="button"
            onClick={clearResponse}
            className="inline-flex rounded-full border border-white/10 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/5 not-dark:border-slate-200 not-dark:text-slate-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear Response
          </button>
          <button
            type="button"
            onClick={() => submitAttempt()}
            disabled={isSubmitting}
            className="rounded-full border border-rose-400/30 bg-rose-500/15 px-5 py-3 font-medium text-rose-200 transition hover:bg-rose-500/25 disabled:opacity-50 not-dark:text-rose-700"
          >
            Submit Test
          </button>
        </div>
      </section>

      <aside className="space-y-5 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Question Palette</p>
          <div className="mt-4 grid grid-cols-5 gap-3">
            {test.questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                onClick={() => selectQuestion(index)}
                className={cn(
                  "aspect-square rounded-2xl text-sm font-semibold ring-1 transition hover:scale-[1.03]",
                  getPaletteClasses(statuses[question.id]),
                  currentIndex === index && "ring-2 ring-offset-2 ring-offset-slate-900 not-dark:ring-offset-white"
                )}
              >
                {question.questionNumber}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 not-dark:border-slate-200 not-dark:bg-slate-50 not-dark:text-slate-700">
          <p className="mb-3 flex items-center gap-2 font-semibold text-white not-dark:text-slate-900">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
            CAT-like status legend
          </p>
          <ul className="space-y-2">
            <li>Answered: Green</li>
            <li>Marked for review: Amber</li>
            <li>Visited but not answered: Red</li>
            <li>Not visited: Slate</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}