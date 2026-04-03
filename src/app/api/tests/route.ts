import tests from "@/data/generated/tests.json" assert { type: "json" };
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("API TESTS:", tests?.length);

  if (!tests || (Array.isArray(tests) && tests.length === 0)) {
    return NextResponse.json([]);
  }

  // ensure array
  const list = Array.isArray(tests) ? tests : [];

  return NextResponse.json(
    list.map((t) => ({
      id: t.id,
      title: t.title || t.name || t.id,
      isFree: t.id === "cat_2025_slot_1" || t.isFree === true
    }))
  );
}
