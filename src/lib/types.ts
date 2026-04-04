export type QuestionType = "MCQ" | "TITA";

export type QuestionRecord = {
  id: string;
  questionNumber: number;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string | number | null;
  correctAnswerOverride?: string | number | null;
  needs_review?: boolean;
  explanation: string;
  sourceQuestionPdf?: string;
  sourceSolutionPdf?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  year?: number | null;
  slot?: number | null;
  section?: "VARC" | "DILR" | "QA" | null;
};

export type TestRecord = {
  id: string;
  title?: string;
  topic: string;
  topicSlug: string;
  type?: "FULL_MOCK" | "TOPIC_TEST";
  testType?: "FULL_MOCK" | "QA_PRACTICE";
  testSource?: "CAT_PYQ" | "CREATED" | "PRACTICE";
  isFree: boolean;
  name: string;
  slug: string;
  durationMinutes: number;
  sections?: { name: "VARC" | "DILR" | "QA"; time: number; questions: QuestionRecord[] }[];
};

export type AttemptResponse = {
  questionId: string;
  userAnswer: string;
  timeTaken: number;
};

export type AttemptSummary = {
  attemptId: string;
  testId: string;
  testName: string;
  topic: string;
  score: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  attemptedCount: number;
  unattemptedCount: number;
  timeTakenSeconds: number;
  submittedAt: string;
};

export type AttemptReviewRecord = AttemptSummary & {
  responses: AttemptResponse[];
};
