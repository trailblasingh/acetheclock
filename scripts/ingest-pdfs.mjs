import fs from "node:fs";
import path from "node:path";

import { PDFParse } from "pdf-parse";

const root = process.cwd();
const outputPath = path.join(root, "data", "generated", "tests.json");
const freeTopics = new Set(["percentages", "basics-of-percentage"]);

let existingOverrides = new Map();
try {
  if (fs.existsSync(outputPath)) {
    const oldTests = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    for (const t of oldTests) {
      for (const q of t.questions) {
        const overrideVal = q.correctAnswerOverride ?? q.correct_answer_override;
        if (overrideVal !== undefined && overrideVal !== null) {
          existingOverrides.set(q.id, String(overrideVal));
        }
      }
    }
  }
} catch (e) {}

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
  const questions = parseQuestions(questionText, pair);
  const solutions = parseSolutions(solutionText, questions);

  const mergedQuestions = questions.map((question) => {
    const solution = solutions.get(question.questionNumber);
    let finalAnswer = solution?.correctAnswer ?? question.correctAnswer ?? "";
    let finalExplanation = (solution?.explanation ?? "").trim();
    
    if (!finalExplanation) {
      finalExplanation = "Explanation not parsed.";
    }

    if (finalAnswer === "" || finalAnswer === null || Number.isNaN(finalAnswer)) {
      console.warn(`Missing answer/solution completely: ${pair.baseName} Q${question.questionNumber}`);
      finalAnswer = "N/A";
    } else {
      let isNumeric = !isNaN(Number(finalAnswer));
      let explanationContainsNum = finalExplanation.includes(String(finalAnswer));

      if (!isNumeric || !explanationContainsNum || finalAnswer === "N/A") {
        console.error(`Invalid parsing: ${question.id}`);
      }
    }

    let needsReview = false;
    if (
      /[xyXY]/.test(finalExplanation) ||
      /≡|mod|\^|\//i.test(finalExplanation) ||
      finalAnswer === "N/A" ||
      finalAnswer === "" ||
      isNaN(Number(finalAnswer))
    ) {
      needsReview = true;
      console.warn(`Needs manual review: ${question.id}`);
    }

    let override_answer = existingOverrides.get(question.id) || null;
    let override_explanation = finalExplanation;
    let override_needs_review = needsReview;

    if (question.question.includes("A college has raised 75% of the amount")) {
      override_answer = "300";
      override_explanation = `Let total number of people = x\n\nPeople already solicited = 60% of x = 0.6x\nRemaining people = 0.4x\n\nAverage donation from already solicited = 600\nSo, amount collected from them = 600 \u00d7 0.6x = 360x\n\nThis is 75% of total required amount\n\nTotal required amount = 360x / 0.75 = 480x\n\nRemaining amount = 25% of total = 120x\n\nNumber of remaining people = 0.4x\n\nAverage donation required = 120x / 0.4x = 300\n\nTherefore, required average donation = 300`;
      override_needs_review = false;
    }

    return {
      ...question,
      correctAnswer: finalAnswer,
      correctAnswerOverride: override_answer,
      needs_review: override_needs_review,
      explanation: override_explanation,
      sourceQuestionPdf: path.basename(pair.questionFile),
      sourceSolutionPdf: path.basename(pair.solutionFile)
    };
  });

  const testSlug = slugify(pair.baseName);

  return {
    id: testSlug.replace(/[^a-z0-9_]+/g, "_"),
    topic,
    topicSlug,
    isFree: freeTopics.has(topicSlug),
    name: titleLine.replace("QA", "CAT").trim(),
    slug: testSlug,
    durationMinutes: mergedQuestions.length >= 20 ? 60 : 30,
    questions: mergedQuestions
  };
}

function parseQuestions(questionText, pair) {
  const standardChunks = questionText.split(/(?:^|\n)Question\s+(\d+)\s*\n/g);
  if (standardChunks.length > 1) {
    return buildQuestionRecords(standardChunks, pair, "after");
  }

  const alternateChunks = questionText.split(/(?:^|\n)Question\s*[--]\s*(\d+)\s*\n/g);
  if (alternateChunks.length > 1) {
    return buildQuestionRecords(alternateChunks, pair, "before");
  }

  return [];
}

function buildQuestionRecords(chunks, pair, mode) {
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
      explanation: ""
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
    let rawBlock = cleanupBlock(chunks[index + 1] ?? "");
    const question = questionMap.get(questionNumber);
    
    let answer = null;
    const explicitMatch = rawBlock.match(/Answer\s*[:-]\s*([A-Za-z0-9.-]+)/i);

    if (explicitMatch) {
      answer = explicitMatch[1];
      if (question && question.type === "MCQ" && /^[a-d]$/i.test(answer)) {
        answer = String(answer.toUpperCase().charCodeAt(0) - 64);
      }
    } else {
      if (question && question.type === "MCQ") {
        const mcqMatch = rawBlock.match(/^([A-D]|\d+)\b/i);
        if (mcqMatch) {
          let a = mcqMatch[1].replace(/\.$/, "");
          if (/^[a-d]$/i.test(a)) {
            answer = String(a.toUpperCase().charCodeAt(0) - 64);
          } else {
            answer = a;
          }
        }
      }
      
      if (answer === null) {
        let rawLines = rawBlock.split('\n');
        for (let i = rawLines.length - 1; i >= 0; i--) {
            let line = rawLines[i].trim();
            if (!line) continue;

            const numbersFound = line.match(/-?\d+(?:\.\d+)?/g) || [];
            
            // STRICT REJECTION
            if (numbersFound.length > 1) continue;
            
            const lineWithoutAllowed = line.replace(/therefore|hence|so|answer/gi, '').trim();
            if (/[a-zA-Z]/.test(lineWithoutAllowed)) continue;

            // CASE 1: PURE NUMBER LINE
            if (/^\s*-?\d+(?:\.\d+)?\s*$/.test(line)) {
                let match = line.match(/-?\d+(?:\.\d+)?/);
                if (match) {
                    answer = match[0];
                    break;
                }
            }

            // CASE 2: FINAL STATEMENT
            if (/(therefore|hence|so|answer)/i.test(line) && numbersFound.length === 1) {
                answer = numbersFound[0];
                break;
            }

            // CASE 3: EQUATION LINE (SAFE ONLY)
            if (line.includes('=')) {
                let rhsMatch = line.match(/=\s*(-?\d+(?:\.\d+)?)\s*$/);
                if (rhsMatch) {
                    answer = rhsMatch[1];
                    break;
                }
            }
        }
      }
    }

    const answerFromKey = answerKey.get(questionNumber) ?? "";
    if (answer === null && answerFromKey) {
      answer = answerFromKey;
      if (question && question.type === "MCQ" && /^[a-d]$/i.test(answer)) {
        answer = String(answer.toUpperCase().charCodeAt(0) - 64);
      } else if (!question || question.type === "TITA") {
        answer = Number(answer);
      }
    }

    let cleanExpl = rawBlock.replace(/[^\x00-\x7F]+/g, "");
    cleanExpl = cleanExpl.replace(/[ \t]{2,}/g, " ");
    let explanation = cleanExpl.trim();

    if (answer === null || answer === "" || answer === "N/A" || Number.isNaN(answer)) {
      const lastLines = explanation.split("\n").slice(-3).join(" ");
      const matches = lastLines.match(/-?\d+(\.\d+)?/g) || [];
      const question_id = question ? question.id : `q${questionNumber}`;
      
      let correct_answer = null;

      if (matches.length > 0) {
        const numbers = matches.map(Number);
        
        // Remove small decimals like 0.4
        const filtered = numbers.filter(n => n >= 1);
        
        if (filtered.length > 0) {
          const maxVal = Math.max(...filtered);
          correct_answer = String(maxVal);
          
          console.log("Fallback FIX applied:", {
            question_id,
            numbers,
            selected: correct_answer
          });
        }
      }

      answer = correct_answer ?? "N/A";

    } else {
        if (question && question.type === "TITA" && !isNaN(Number(answer))) {
            answer = Number(answer);
        } else if (typeof answer !== "number") {
            answer = String(answer);
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
    .replace(/^Arithmetic\s*-\s*\d+\s*/i, "")
    .replace(/^Numbers\s*-\s*\d+\s*/i, "")
    .replace(/^Algebra\s*-\s*\d+\s*/i, "")
    .replace(/^Modern Mathematics\s*-\s*\d+\s*/i, "")
    .replace(/^Geometry\s*RT\s*/i, "Geometry")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}