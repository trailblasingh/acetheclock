import { notFound } from "next/navigation";

import { ExamRunner } from "@/components/exam-runner";
import { getTestById } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  let test: any = null;
  try {
    const res = await fetch(`${base}/api/tests/${testId}`, { cache: "no-store" });
    if (res.ok) {
      test = await res.json();
    }
  } catch (error) {
    // ignore
  }

  if (!test || !test.sections) {
    test = getTestById(testId);
  }

  if (!test || !test.sections) {
    notFound();
  }

  return <ExamRunner test={test} />;
}
