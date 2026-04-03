import tests from "../../../../data/generated/tests.json" assert { type: "json" };
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("API TESTS:", (tests as any)?.length);

  if (!tests || (Array.isArray(tests) && tests.length === 0)) {
    return NextResponse.json({ tests: [] });
  }

  const list = Array.isArray(tests) ? (tests as any[]) : [];

  return NextResponse.json({ tests: list });
}
