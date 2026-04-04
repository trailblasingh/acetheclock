import fs from "node:fs";
import path from "node:path";

import type { TestRecord } from "@/lib/types";

const generatedPath = path.join(process.cwd(), "data", "generated", "tests.json");

const defaultSections = [
  { name: "VARC" as const, time: 40, questions: [] as any[] },
  { name: "DILR" as const, time: 40, questions: [] as any[] },
  { name: "QA" as const, time: 40, questions: [] as any[] }
];

function enrichTest(record: TestRecord): TestRecord {
  const title = record.title ?? record.name ?? record.id;
  const isFree = record.isFree ?? record.id === "cat_2025_slot_1";
  const type = record.type;
  
  const sections = record?.sections || defaultSections;
  const enrichedSections = (sections || []).map(sec => ({
    ...sec,
    questions: (sec?.questions || []).map((q: any) => ({
      section: q.section ?? sec.name,
      difficulty: q.difficulty ?? "Medium",
      topic: q.topic ?? record.topic,
      subtopic: q.subtopic ?? record.topic,
      ...q
    }))
  }));

  return {
    ...record,
    type,
    title,
    name: record.name ?? title,
    isFree,
    sections: enrichedSections
  };
}

function getFallbackCatalog(): TestRecord[] {
  return [
    enrichTest({
      id: "cat_2025_slot_1",
      title: "CAT 2025 Slot 1",
      topic: "Percentages",
      topicSlug: "percentages",
      type: "FULL_MOCK",
      isFree: true,
      name: "CAT 2025 Slot 1",
      slug: "cat-2025-slot-1",
      durationMinutes: 120,
      sections: [
        {
          name: "QA",
          time: 40,
          questions: [
            {
              id: "cat_2025_slot_1_q1",
              questionNumber: 1,
              type: "MCQ",
              question:
                "If a trader marks an article 25% above cost price and gives a 10% discount, what is the profit percentage?",
              options: ["10%", "12.5%", "15%", "17.5%"],
              correctAnswer: "12.5%",
              explanation:
                "Let cost price be 100. Marked price becomes 125 and discount makes the selling price 112.5. Profit is 12.5 on a base of 100, so the gain is 12.5%.",
              sourceQuestionPdf: "seed",
              sourceSolutionPdf: "seed",
              difficulty: "Easy",
              year: 2025,
              slot: 1,
              section: "QA",
              topic: "Percentages",
              subtopic: "Percentages"
            }
          ]
        }
      ]
    })
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

  try {
    const parsed = JSON.parse(raw) as TestRecord[];
    const catalog = (parsed.length > 0 ? parsed : getFallbackCatalog()).map(enrichTest);
    return catalog;
  } catch (error) {
    console.error("Failed to parse tests.json:", error);
    return getFallbackCatalog();
  }
}

export function getTestById(testId: string) {
  return getTestCatalog().find((test) => test.id === testId) ?? null;
}

export function getTopics() {
  const tests = getTestCatalog() || [];
  const map = new Map<
    string,
    { slug: string; name: string; isFree: boolean; testCount: number; totalQuestions: number }
  >();

  for (const test of tests) {
    const isTopic = test.testType === "QA_PRACTICE";
    if (!isTopic) continue;

    const current =
      map.get(test.topicSlug) ??
      {
        slug: test.topicSlug,
        name: test.topic,
        isFree: test.isFree,
        testCount: 0,
        totalQuestions: 0
      };

    const sections = test?.sections || [];
    const testQuestionsCount = sections.reduce((sum, sec) => sum + (sec?.questions?.length || 0), 0) || 0;
    current.isFree = current.isFree || test.isFree;
    current.testCount += 1;
    current.totalQuestions += testQuestionsCount;
    map.set(test.topicSlug, current);
  }

  return [...map.values()];
}

