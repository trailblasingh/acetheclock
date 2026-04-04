import tests from "../../../../data/generated/tests.json" assert { type: "json" };
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const testList = Array.isArray(tests) ? tests : [];
  
  console.log("TEST COUNT:", testList.length);
  console.log("FIRST TEST:", JSON.stringify(testList[0], null, 2));

  if (testList.length === 0) {
    console.error("Ingestion failed: no tests. Fix ingestion pipeline first.");
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }

  return NextResponse.json({ tests: testList });
}
