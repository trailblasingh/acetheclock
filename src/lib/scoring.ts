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

  const questions = test?.sections?.flatMap((s: any) => s.questions || []) || [];

  for (const question of questions) {
    const response = responseMap.get(question.id);
    const answer = response?.userAnswer?.trim();

    if (!answer) {
      continue;
    }

    attemptedCount += 1;

    const finalAnswer = question.correctAnswerOverride ?? question.correctAnswer ?? null;

    let isCorrect = false;

    const getMCQIndex = (val: any) => {
      if (!val) return null;
      const match = val.toString().match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    let userIndex: number | null = null;
    let correctIndex: number | null = null;

    if (question.type === "MCQ") {
      userIndex = getMCQIndex(answer);
      correctIndex = parseInt(String(finalAnswer || ""), 10);
      isCorrect = userIndex !== null && correctIndex !== null && userIndex === correctIndex;
    } else {
      isCorrect = normalize(answer) === normalize(finalAnswer);
    }

    console.log({
      type: question.type,
      userAnswer: answer,
      correctAnswer: finalAnswer,
      userIndex,
      correctIndex,
      isCorrect
    });

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

  const totalQuestions = questions.length;
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

function normalize(val: any) {
  if (!val) return "";
  return val
    .toString()
    .replace(/,/g, "")
    .replace(/Option\s*\d*:\s*/i, "")
    .trim();
}

function getOptionLabel(answer: string) {
  if (!/^\d+$/.test(answer)) {
    return answer;
  }

  const options = ["A", "B", "C", "D"];
  return options[Number(answer) - 1] ?? answer;
}
