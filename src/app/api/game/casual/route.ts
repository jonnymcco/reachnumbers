import { NextResponse } from "next/server";
import { generateCasualPuzzle, MAX_LARGE_NUMBERS } from "@/lib/game/generate";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("numLarge");
  const parsed = raw === null ? 0 : Number.parseInt(raw, 10);
  const numLarge = Number.isFinite(parsed)
    ? Math.max(0, Math.min(MAX_LARGE_NUMBERS, parsed))
    : 0;

  const puzzle = generateCasualPuzzle(numLarge);
  return NextResponse.json(puzzle);
}
