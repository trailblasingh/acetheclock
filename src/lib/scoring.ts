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

  const responseMap = new Map(responses.map((response) => [response.questionId, response]));

  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let attemptedCount = 0;

  for (const question of test.questions) {
    const response = responseMap.get(question.id);
    const answer = response?.selectedAnswer?.trim();

    if (!answer) {
      continue;
    }

    attemptedCount += 1;

    const finalCorrectAnswer = question.correct_answer_override ?? question.correctAnswer;

    console.log({
      override: question.correct_answer_override,
      base: question.correctAnswer,
      final: finalCorrectAnswer
    });

    const isCorrect =
      question.type === "MCQ"
        ? answer === String(finalCorrectAnswer) || answer === getOptionLabel(String(finalCorrectAnswer))
        : Math.abs(Number(answer) - Number(finalCorrectAnswer)) < 1e-6;

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
