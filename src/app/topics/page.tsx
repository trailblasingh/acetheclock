import { TopicsClient } from "@/components/topics-client";
import { getTestCatalog, getTopics } from "@/lib/catalog";

export default function TopicsPage() {
  return <TopicsClient topics={getTopics()} tests={getTestCatalog()} />;
}