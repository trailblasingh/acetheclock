import { getTestById } from "@/lib/catalog";
import type { AttemptResponse, AttemptSummary } from "@/lib/types";

export function scoreAttempt(
  testId: string,
  responses: AttemptResponse[],
  timeTakenSeconds: number
): AttemptSummary {
  const test = getTestById(testId);

  if (!test) {
    throw new Error(`Test "${testId}" not found.`);
  }

  const responseMap = new Map(responses.map((response: any) => [response.questionId, response]));

  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let attemptedCount = 0;

  for (const question of test.questions) {
    const response = responseMap.get(question.id);
    const answer = response?.userAnswer?.trim();

    if (!answer) {
      continue;
    }

    attemptedCount += 1;

    const finalAnswer = question.correctAnswerOverride ?? question.correctAnswer ?? "NA";

    const isCorrect =
      question.type === "MCQ"
        ? normalize(answer) === normalize(String(finalAnswer)) || normalize(answer) === normalize(getOptionLabel(String(finalAnswer)))
        : normalize(answer) === normalize(String(finalAnswer));

    if (isCorrect) {
      score += 3;
      correctCount += 1;
      continue;
    }

    incorrectCount += 1;

    if (question.type === "MCQ") {
      score -= 1;
    }
  }

  const totalQuestions = test.questions.length;
  const unattemptedCount = totalQuestions - attemptedCount;
  const accuracy = attemptedCount === 0 ? 0 : Number(((correctCount / attemptedCount) * 100).toFixed(2));

  return {
    attemptId: crypto.randomUUID(),
    testId: test.id,
    testName: test.name,
    topic: test.topic,
    score,
    accuracy,
    correctCount,
    incorrectCount,
    attemptedCount,
    unattemptedCount,
    timeTakenSeconds,
    submittedAt: new Date().toISOString()
  };
}

function normalize(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function getOptionLabel(answer: string) {
  if (!/^\d+$/.test(answer)) {
    return answer;
  }

  const options = ["A", "B", "C", "D"];
  return options[Number(answer) - 1] ?? answer;
}
