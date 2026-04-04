export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getTestById } from "@/lib/catalog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const test = getTestById(testId);

  console.log("TEST DATA:", test);

  if (!test) {
    return NextResponse.json({ message: "Test not found." }, { status: 404 });
  }

  const enrichedSections = (test.sections || []).map((sec: any) => ({
    ...sec,
    questions: (sec.questions || []).map((q: any) => ({
      ...q,
      correctAnswer: q.correctAnswer ?? null,
      correctAnswerOverride: q.correctAnswerOverride ?? null
    }))
  }));

  return NextResponse.json({
    ...test,
    sections: enrichedSections
  });
}
