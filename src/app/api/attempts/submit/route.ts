import { NextResponse } from "next/server";
import { z } from "zod";

import { scoreAttempt } from "@/lib/scoring";

const responseSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string(),
  timeTaken: z.number()
});

const payloadSchema = z.object({
  testId: z.string(),
  timeTakenSeconds: z.number(),
  responses: z.array(responseSchema)
});

export async function POST(request: Request) {
  try {
    const payload = payloadSchema.parse(await request.json());
    const scored = scoreAttempt(payload.testId, payload.responses, payload.timeTakenSeconds);
    return NextResponse.json(scored);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to score attempt." },
      { status: 400 }
    );
  }
}
