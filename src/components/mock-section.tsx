"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MockSection() {
  const [tests, setTests] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tests")
      .then((res) => res.json())
      .then((data) => {
        console.log("MOCK TESTS:", data);
        setTests(data || []);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);
      });
  }, []);

  if (!tests.length) {
    return (
      <div className="px-6 py-10 text-gray-500">
        Loading CAT mocks...
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">Full-Length CAT Mocks</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-bold">{test.title}</h3>

            <p className="text-sm text-gray-500 mb-2">VARC • DILR • QA (40 mins each)</p>

            <span
              className={	ext-xs font-semibold }
            >
              {test.isFree ? "FREE" : "PREMIUM"}
            </span>

            <button
              className="mt-4 w-full bg-black text-white py-2 rounded-lg"
              onClick={() => router.push(/test/)}
            >
              Start Mock ?
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
