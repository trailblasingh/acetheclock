"use client";

import { useEffect, useState } from "react";

type Test = {
  id: string;
  title?: string;
  name?: string;
  isFree?: boolean;
};

export default function MockSection() {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    fetch("/api/tests", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        console.log("FRONTEND TESTS:", data);
        setTests((data?.tests as Test[]) || []);
      })
      .catch((error) => console.error(error));
  }, []);

  if (!tests.length) {
    return <div className="p-4 text-sm">No mocks available</div>;
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">Full Length CAT Mocks</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {(tests || []).map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="font-semibold">{t.title || t.name || t.id}</div>

            <div className="text-xs text-gray-500 mt-1">
              120 mins • VARC + DILR + QA
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
