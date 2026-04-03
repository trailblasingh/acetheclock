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
      .then((data) => setTests((data?.tests as Test[]) || []))
      .catch((error) => console.error(error));
  }, []);

  if (!tests.length) return null;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">Full-Length CAT Mocks</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {tests.map((t: Test) => (
          <div key={t.id} className="p-4 border rounded-xl">
            <div>{t.title || t.name || t.id}</div>
            <div className="text-xs mt-2">{t.isFree ? "FREE" : "LOCKED"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

