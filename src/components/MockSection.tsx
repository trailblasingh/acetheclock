"use client";

import { useEffect, useState } from "react";

type Test = {
  id: string;
  title?: string;
  name?: string;
  isFree?: boolean;
  type?: string;
  testType?: string;
};

export default function MockSection() {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    fetch("/api/tests", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        console.log("ALL TESTS:", data?.tests);
        setTests((data?.tests as Test[]) || []);
      })
      .catch((error) => console.error(error));
  }, []);

  const fullMocks = (tests || []).filter((t: any) => t.testType === "FULL_MOCK");

  console.log("ALL TESTS:", tests);
  console.log("VISIBLE MOCKS:", fullMocks);

  if (!fullMocks.length) {
    return <div className="p-4 text-sm">No full mocks available yet</div>;
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">Full Length CAT Mocks</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {fullMocks.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="font-semibold">
              {t.testType === "FULL_MOCK" ? t.title || t.name || t.id : `QA: ${t.title || t.name || t.id}`}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              {t.testType === "FULL_MOCK" ? "120 mins • VARC + DILR + QA" : "QA Practice Test"}
            </div>

            <div className="mt-3">
              {t.isFree ? (
                <span className="text-green-600 text-xs font-bold">FREE</span>
              ) : (
                <span className="text-red-500 text-xs font-bold">LOCKED</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


