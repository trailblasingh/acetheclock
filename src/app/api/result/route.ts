export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getTestById } from "@/lib/catalog";
import { scoreAttempt } from "@/lib/scoring";

const responseSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string(),
  timeTaken: z.number()
});

const payloadSchema = z.object({
  testId: z.string(),
  timeTakenSeconds: z.number().optional(),
  responses: z.array(responseSchema)
});

export async function POST(request: Request) {
  try {
    const payload = payloadSchema.parse(await request.json());
    const test = getTestById(payload.testId);
    if (!test) {
      return NextResponse.json({ message: "Test not found" }, { status: 404 });
    }

    const summary = scoreAttempt(payload.testId, payload.responses, payload.timeTakenSeconds ?? 0);

    const sectionBreakdown = Object.values(
      payload.responses.reduce((acc, response) => {
        const question = test.questions.find((q) => q.id === response.questionId);
        const key = (question?.section as string) ?? "QA";
        acc[key] = acc[key] ?? { section: key, attempted: 0 };
        if (response.userAnswer?.trim()) {
          acc[key].attempted += 1;
        }
        return acc;
      }, {} as Record<string, { section: string; attempted: number }>)
    );

    return NextResponse.json({ ...summary, sectionBreakdown });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to score result." },
      { status: 400 }
    );
  }
}
