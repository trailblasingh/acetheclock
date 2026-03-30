import fs from "node:fs";
import path from "node:path";

import type { TestRecord } from "@/lib/types";

const generatedPath = path.join(process.cwd(), "data", "generated", "tests.json");

function getFallbackCatalog(): TestRecord[] {
  return [
    {
      id: "demo_percentages",
      topic: "Percentages",
      topicSlug: "percentages",
      isFree: true,
      name: "Percentages Sprint",
      slug: "percentages-sprint",
      durationMinutes: 25,
      questions: [
        {
          id: "demo_percentages_q1",
          questionNumber: 1,
          type: "MCQ",
          question:
            "If a trader marks an article 25% above cost price and gives a 10% discount, what is the profit percentage?",
          options: ["10%", "12.5%", "15%", "17.5%"],
          correctAnswer: "12.5%",
          explanation:
            "Let cost price be 100. Marked price becomes 125 and discount makes the selling price 112.5. Profit is 12.5 on a base of 100, so the gain is 12.5%.",
          sourceQuestionPdf: "seed",
          sourceSolutionPdf: "seed"
        }
      ]
    }
  ];
}

export function getTestCatalog(): TestRecord[] {
  if (!fs.existsSync(generatedPath)) {
    return getFallbackCatalog();
  }

  const raw = fs.readFileSync(generatedPath, "utf8");

  if (!raw.trim()) {
    return getFallbackCatalog();
  }

  const parsed = JSON.parse(raw) as TestRecord[];
  return parsed.length > 0 ? parsed : getFallbackCatalog();
}

export function getTestById(testId: string) {
  return getTestCatalog().find((test) => test.id === testId) ?? null;
}

export function getTopics() {
  const tests = getTestCatalog();
  const map = new Map<
    string,
    { slug: string; name: string; isFree: boolean; testCount: number; totalQuestions: number }
  >();

  for (const test of tests) {
    const current =
      map.get(test.topicSlug) ??
      {
        slug: test.topicSlug,
        name: test.topic,
        isFree: test.isFree,
        testCount: 0,
        totalQuestions: 0
      };

    current.testCount += 1;
    current.totalQuestions += test.questions.length;
    map.set(test.topicSlug, current);
  }

  return [...map.values()];
}
