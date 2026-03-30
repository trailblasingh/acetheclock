import { ResultSummary } from "@/components/result-summary";

export default async function ResultPage({
  params
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <ResultSummary attemptId={attemptId} />;
}
