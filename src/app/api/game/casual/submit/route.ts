import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LARGE_POOL, SMALL_POOL, TARGET_MAX, TARGET_MIN, TOTAL_NUMBERS } from "@/lib/game/generate";
import { solve } from "@/lib/game/solver";

const VALID_TILE_VALUES = new Set<number>([...LARGE_POOL, ...SMALL_POOL]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Log in to save your score to the leaderboard." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const score = Number(body?.score);
  const target = Number(body?.target);
  const numbers: number[] | null = Array.isArray(body?.numbers)
    ? body.numbers.map((n: unknown) => Number(n))
    : null;

  if (!Number.isInteger(target) || target < TARGET_MIN || target > TARGET_MAX) {
    return NextResponse.json({ error: "Invalid target." }, { status: 400 });
  }
  if (
    !numbers ||
    numbers.length !== TOTAL_NUMBERS ||
    numbers.some((n) => !Number.isInteger(n) || !VALID_TILE_VALUES.has(n))
  ) {
    return NextResponse.json({ error: "Invalid number set." }, { status: 400 });
  }
  if (!Number.isInteger(score) || score <= 0) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }

  const reachability = solve(numbers, score);
  if (!reachability || reachability.value !== score) {
    return NextResponse.json(
      { error: "That score isn't reachable from the given numbers." },
      { status: 400 },
    );
  }

  const entry = await prisma.leaderboardEntry.create({
    data: {
      userId: session.user.id,
      score,
      target,
      isDailyPuzzle: false,
    },
  });

  return NextResponse.json({
    score: entry.score,
    target: entry.target,
    difference: Math.abs(entry.score - entry.target),
    exact: entry.score === entry.target,
  });
}
