import { notFound } from "next/navigation";

import { ExamRunner } from "@/components/exam-runner";
import { getTestById } from "@/lib/catalog";

export default async function TestPage({
  params
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = getTestById(testId);

  if (!test) {
    notFound();
  }

  return <ExamRunner test={test} />;
}
