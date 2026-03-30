import { NextResponse } from "next/server";

import { getTestById } from "@/lib/catalog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const test = getTestById(testId);

  if (!test) {
    return NextResponse.json({ message: "Test not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: test.id,
    name: test.name,
    questions: test.questions
  });
}