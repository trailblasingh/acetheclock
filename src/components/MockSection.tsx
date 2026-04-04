import { useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole, Play } from "lucide-react";

type Test = {
  id: string;
  title?: string;
  name?: string;
  isFree?: boolean;
  type?: string;
  testType?: string;
  durationMinutes?: number;
  totalQuestions?: number;
  price?: number;
};

export default function MockSection() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    setIsPaid(localStorage.getItem("isPaidUser") === "true");
    
    fetch("/api/tests", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setTests((data?.tests as Test[]) || []);
      })
      .catch((error) => console.error(error));
  }, []);

  const fullMocks = (tests || []).filter((t: any) => t.testType === "FULL_MOCK");

  if (!(fullMocks || []).length) {
    return null;
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-semibold mb-1">Testing Pipeline</p>
          <h2 className="text-3xl font-bold text-white not-dark:text-slate-900">Full Length CAT Mocks</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(fullMocks || []).map((t) => {
          const isLocked = !t.isFree && !isPaid;
          
          return (
            <div
              key={t.id}
              className="group relative p-6 rounded-[32px] border border-white/10 bg-slate-900/50 backdrop-blur-sm transition-all hover:bg-slate-800/50 not-dark:border-slate-200 not-dark:bg-white not-dark:hover:bg-slate-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-wider text-indigo-300 font-bold">
                  {t.durationMinutes || 120} Mins
                </div>
                {t.isFree ? (
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                    Free Mock
                  </div>
                ) : isLocked ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                    <LockKeyhole className="h-3 w-3" />
                    Premium
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                    Unlocked
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white not-dark:text-slate-900 mb-1 group-hover:text-indigo-400 transition-colors">
                {t.title || t.name}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Full mock with VARC, DILR, and QA sections
              </p>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {t.totalQuestions || 66} Questions
                </div>
                
                {isLocked ? (
                  <Link
                    href="/payment"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-sm font-bold text-white transition hover:bg-indigo-400 shadow-lg shadow-indigo-500/20"
                  >
                    Unlock now
                  </Link>
                ) : (
                  <Link
                    href={`/test/${t.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-indigo-500/50 text-sm font-bold text-indigo-400 transition hover:bg-indigo-500/10"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Start Test
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



