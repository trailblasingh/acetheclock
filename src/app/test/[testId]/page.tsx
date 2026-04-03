import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ExamRunner } from "@/components/exam-runner";
import { getTestById } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;

  const host = headers().get("host");
  const baseUrl = host?.startsWith("http") ? host : http://;
  const res = await fetch(${baseUrl}/api/tests/, { cache: "no-store" });
  const apiTest = res.ok ? await res.json() : null;
  const fallback = getTestById(testId);
  const test = apiTest ?? fallback;

  if (!test || !test.questions) {
    notFound();
  }

  return <ExamRunner test={test} />;
}
