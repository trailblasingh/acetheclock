import fs from "node:fs";
import path from "node:path";

import { PDFParse } from "pdf-parse";

const root = process.cwd();
const outputPath = path.join(root, "data", "generated", "tests.json");

const pairs = discoverPdfPairs(root);
const tests = [];

for (const pair of pairs) {
  const questionText = await extractText(pair.questionFile);
  const solutionText = await extractText(pair.solutionFile);
  tests.push(buildTestRecord(pair, questionText, solutionText));
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(tests, null, 2));
console.log(`Generated ${tests.length} tests into ${outputPath}`);

function discoverPdfPairs(directory) {
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.toLowerCase().endsWith(".pdf"))
    .sort((left, right) => left.localeCompare(right));

  const grouped = new Map();

  for (const file of files) {
    const normalized = file
      .replace(/\s+Sol\.pdf$/i, "")
      .replace(/\s+S\.pdf$/i, "")
      .replace(/\s+Q(?:\s+\(1\))?\.pdf$/i, "")
      .trim();

    const current = grouped.get(normalized) ?? {};

    if (/\s+(Sol|S)\.pdf$/i.test(file)) {
      current.solutionFile = path.join(directory, file);
    } else if (/\s+Q(?:\s+\(1\))?\.pdf$/i.test(file)) {
      current.questionFile = path.join(directory, file);
    }

    current.baseName = normalized;
    grouped.set(normalized, current);
  }

  return [...grouped.values()].filter((pair) => pair.questionFile && pair.solutionFile);
}

async function extractText(filePath) {
  const parser = new PDFParse({ data: fs.readFileSync(filePath) });
  const result = await parser.getText();
  await parser.destroy();
  return normalizeRawText(result.text);
}

function buildTestRecord(pair, questionText, solutionText) {
  const lines = questionText.split("\n").map((line) => line.trim()).filter(Boolean);
  const titleLine = lines[0] ?? pair.baseName;
  const topicLine = lines.find((line, index) => index > 0 && !line.startsWith("--")) ?? pair.baseName;
  const topic = normalizeTopicName(topicLine);
  const topicSlug = slugify(topic);

  const meta = inferMeta(pair.baseName, topic, questionText);
  const questions = parseQuestions(questionText, pair, meta);
  const solutions = parseSolutions(solutionText, questions);

  const mergedQuestions = questions.map((question) => {
    const solution = solutions.get(question.questionNumber) ?? { correctAnswer: "", explanation: "" };
    const explanation = solution.explanation.trim() || "Explanation not parsed.";
    const rawAnswer = solution.correctAnswer;
    const finalAnswer =
      normalizeAnswer(question, rawAnswer) ||
      (question.type === "TITA" ? extractLastNumber(explanation) : "") ||
      "Answer not available";

    console.log(`Q${question.questionNumber} -> ${finalAnswer}`);
    if (finalAnswer === "Answer not available") {
      console.warn(`Missing answer for Q${question.questionNumber}`);
    }

    return {
      ...question,
      correctAnswer: finalAnswer,
      explanation,
      sourceQuestionPdf: path.basename(pair.questionFile),
      sourceSolutionPdf: path.basename(pair.solutionFile),
      topic,
      subtopic: topic,
      difficulty: question.difficulty ?? "Medium",
      year: meta.year,
      slot: meta.slot,
      section: question.section || meta.section
    };
  });

  const durationByCount = mergedQuestions.length >= 60 ? 120 : mergedQuestions.length >= 20 ? 60 : 30;

  const isFullMock = determineFullMock({
    baseName: pair.baseName,
    questionText,
    questionCount: mergedQuestions.length,
    durationMinutes: durationByCount,
    hasSectionMarkers: meta.hasSectionMarkers
  });

  const type = isFullMock ? "FULL_MOCK" : "TOPIC_TEST";

  const title = isFullMock ? buildFullMockTitle(pair.baseName, meta) : buildTopicTitle(pair.baseName, topic);

  const isFree =
    (type === "FULL_MOCK" && title.toLowerCase() === "cat 2025 slot 1") ||
    title.toLowerCase().includes("basics of percentage");

  console.log("TEST TYPE:", title, type, isFree);

  const sections = isFullMock
    ? [
        { name: "VARC", time: 40 },
        { name: "DILR", time: 40 },
        { name: "QA", time: 40 }
      ]
    : [{ name: "QA", time: 60 }];

  const durationMinutes = isFullMock ? 120 : durationByCount;

  const testSlug = meta.testId ?? slugify(pair.baseName).replace(/-/g, "_");

  return {
    id: testSlug,
    title,
    topic,
    topicSlug,
    type,
    isFree,
    name: title,
    slug: testSlug,
    durationMinutes,
    sections,
    questions: mergedQuestions
  };
}

function parseQuestions(questionText, pair, meta) {
  const standardChunks = questionText.split(/(?:^|\n)Question\s+(\d+)\s*\n/g);
  if (standardChunks.length > 1) {
    return buildQuestionRecords(standardChunks, pair, "after", meta);
  }

  const alternateChunks = questionText.split(/(?:^|\n)Question\s*[--]\s*(\d+)\s*\n/g);
  if (alternateChunks.length > 1) {
    return buildQuestionRecords(alternateChunks, pair, "before", meta);
  }

  return [];
}

function buildQuestionRecords(chunks, pair, mode, meta) {
  const questions = [];

  for (let index = 1; index < chunks.length; index += 2) {
    const questionNumber = Number(chunks[index]);
    const rawBody = cleanupBlock(mode === "after" ? chunks[index + 1] ?? "" : chunks[index - 1] ?? "");
    const body = mode === "before" ? stripHeader(rawBody) : rawBody;
    const options = [...body.matchAll(/^\((\d)\)\s+([\s\S]*?)(?=^\(\d\)\s+|\s*$)/gm)].map((match) =>
      cleanupBlock(match[2])
    );
    const question = options.length > 0 ? cleanupBlock(body.replace(/^\((\d)\)\s+[\s\S]*$/gm, "")) : body;

    questions.push({
      id: `${slugify(pair.baseName).replace(/-/g, "_")}_q${questionNumber}`,
      questionNumber,
      type: options.length > 0 ? "MCQ" : "TITA",
      question,
      options,
      correctAnswer: "",
      explanation: "",
      difficulty: "Medium",
      year: meta.year,
      slot: meta.slot,
      section: meta.section ?? "QA",
      topic: meta.topic,
      subtopic: meta.topic
    });
  }

  return questions;
}

function parseSolutions(solutionText, questions) {
  const answerKey = extractAnswerKey(solutionText);
  const cleaned = solutionText.replace(/--\s*\d+\s+of\s+\d+\s*--/g, "").trim();
  const chunks = cleaned.split(/(?:^|\n)(\d+)\.\s+/g);
  const solutionMap = new Map();
  const questionMap = new Map((questions || []).map((q) => [q.questionNumber, q]));

  for (let index = 1; index < chunks.length; index += 2) {
    const questionNumber = Number(chunks[index]);
    const question = questionMap.get(questionNumber);
    const rawBlock = cleanupBlock(chunks[index + 1] ?? "");

    const explicitAnswer = rawBlock.match(/Answer\s*[:\-]\s*([A-Za-z0-9.%/-]+)/i)?.[1] ?? "";
    let answer = explicitAnswer;

    if (!answer && question && question.type === "MCQ") {
      const mcqLead = rawBlock.match(/^([A-D]|\d+)\b/i);
      if (mcqLead) {
        const token = mcqLead[1].replace(/\.$/, "");
        answer = /^[a-d]$/i.test(token) ? String(token.toUpperCase().charCodeAt(0) - 64) : token;
      }
    }

    if (!answer) {
      const keyAnswer = answerKey.get(questionNumber);
      if (keyAnswer) {
        answer = keyAnswer;
      }
    }

    const explanation = rawBlock.trim() || "Explanation not parsed.";

    if (!answer) {
      const lastNum = extractLastNumber(explanation);
      if (lastNum) {
        answer = lastNum;
      }
    }

    solutionMap.set(questionNumber, {
      correctAnswer: answer,
      explanation
    });
  }

  return solutionMap;
}

function extractAnswerKey(solutionText) {
  const map = new Map();
  const lines = solutionText.split("\n").map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const normalized = line.replace(/\s+/g, " ").trim();

    if (!/^(\d+\s+[-A-Za-z0-9.%/]+(?:\s+|$)){8,}/.test(normalized)) {
      continue;
    }

    const tokens = normalized.split(" ");

    for (let index = 0; index < tokens.length - 1; index += 2) {
      const questionNumber = Number(tokens[index]);
      const answer = tokens[index + 1];

      if (Number.isFinite(questionNumber)) {
        map.set(questionNumber, answer);
      }
    }
  }

  return map;
}

function inferMeta(baseName, topic, questionText) {
  const lower = baseName.toLowerCase();
  const yearMatch = baseName.match(/(20\d{2}|19\d{2})/);
  const slotMatch = baseName.match(/slot[-_\s]*([123])/i);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  const slot = slotMatch ? Number(slotMatch[1]) : null;
  const section = /varc|verbal/.test(lower)
    ? "VARC"
    : /dilr|lrdi|logical|data/.test(lower)
      ? "DILR"
      : "QA";

  const testId = year ? `cat_${year}_slot_${slot ?? 1}` : slugify(baseName).replace(/-/g, "_");
  const title = year ? `CAT ${year} Slot ${slot ?? 1}` : baseName;
  const hasSectionMarkers = /varc|dilr|lrdi/.test(questionText.toLowerCase());

  return { year, slot, section, testId, title, topic, hasSectionMarkers };
}

function determineFullMock({ baseName, questionText, questionCount, durationMinutes, hasSectionMarkers }) {
  const lowerName = baseName.toLowerCase();
  const hasCatSlot = lowerName.includes("cat") && lowerName.includes("slot");
  const hasExplicitSections = /varc/.test(questionText.toLowerCase()) && /(dilr|lrdi)/.test(questionText.toLowerCase()) && /qa/.test(questionText.toLowerCase());
  const manyQuestions = questionCount >= 60;
  const longDuration = durationMinutes >= 120;
  const sectionFlag = hasSectionMarkers;

  return manyQuestions || hasExplicitSections || hasCatSlot || sectionFlag || longDuration;
}

function buildFullMockTitle(baseName, meta) {
  const match = baseName.match(/cat[^0-9]*(20\d{2})[^0-9]*slot[^0-9]*([123])/i);
  if (match) {
    return `CAT ${match[1]} Slot ${match[2]}`;
  }
  if (meta.year) {
    return `CAT ${meta.year} Slot ${meta.slot ?? 1}`;
  }
  return "CAT Full Mock";
}

function buildTopicTitle(baseName, topic) {
  const cleaned = baseName
    .replace(/^\d+\s*/g, "")
    .replace(/qa\s*[:-]?\s*/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  const numberMatch = cleaned.match(/(\d+)$/);
  if (numberMatch) {
    return `${topic} Practice ${numberMatch[1]}`;
  }

  return cleaned || `${topic} Practice`;
}

function normalizeRawText(text) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/[\u00d7\uf0d7]/g, " x ")
    .replace(/\uf0de/g, " => ")
    .replace(/\uf05c/g, " Therefore ")
    .replace(/\uf03d/g, " = ")
    .replace(/\uf02b/g, " + ")
    .replace(/\uf02d/g, " - ")
    .replace(/\uf0a3/g, " <= ")
    .replace(/\uf0b3/g, " >= ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function cleanupBlock(value) {
  return value
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, "")
    .replace(/Page\s+\d+[^\n]*/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripHeader(value) {
  return value
    .replace(/^QA\s+.*?\nReview Test\s*-\s*\d+\n?/i, "")
    .replace(/^QA\s+.*?\nReview Test\n?/i, "")
    .trim();
}

function normalizeTopicName(raw) {
  return raw
    .replace(/^QA\s*[:-]?\s*/i, "")
    .replace(/^Arithmetic\s*-\s*\d+\s*/i, "Arithmetic")
    .replace(/^Numbers\s*-\s*\d+\s*/i, "Numbers")
    .replace(/^Algebra\s*-\s*\d+\s*/i, "Algebra")
    .replace(/^Modern Mathematics\s*-\s*\d+\s*/i, "Modern Mathematics")
    .replace(/^Geometry\s*RT\s*/i, "Geometry")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractLastNumber(text) {
  const matches = [...text.matchAll(/-?\d+(?:\.\d+)?/g)];
  if (!matches.length) return "";
  return matches[matches.length - 1][0];
}

function normalizeAnswer(question, rawAnswer) {
  if (!rawAnswer) return "";
  if (question.type === "MCQ") {
    return String(rawAnswer).trim();
  }
  const num = extractLastNumber(String(rawAnswer));
  return num || String(rawAnswer).trim();
}
