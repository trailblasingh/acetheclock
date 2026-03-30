export type QuestionType = "MCQ" | "TITA";

export type QuestionRecord = {
  id: string;
  questionNumber: number;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation: string;
  sourceQuestionPdf?: string;
  sourceSolutionPdf?: string;
};

export type TestRecord = {
  id: string;
  topic: string;
  topicSlug: string;
  isFree: boolean;
  name: string;
  slug: string;
  durationMinutes: number;
  questions: QuestionRecord[];
};

export type AttemptResponse = {
  questionId: string;
  selectedAnswer: string;
  timeSpentSeconds: number;
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