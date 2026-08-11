import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateDailyPuzzle, todayDateString } from "@/lib/game/generate";
import { solve } from "@/lib/game/solver";
import type { Step } from "@/lib/game/engine";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to play the Daily Puzzle." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const score = Number(body?.score);
  const timeTaken = Number(body?.timeTaken);

  if (!Number.isInteger(score) || score <= 0) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }
  if (!Number.isInteger(timeTaken) || timeTaken < 0 || timeTaken > 24 * 60 * 60) {
    return NextResponse.json({ error: "Invalid time taken." }, { status: 400 });
  }

  const date = todayDateString();
  const puzzle = generateDailyPuzzle(date);

  const reachability = solve(puzzle.numbers, score);
  if (!reachability || reachability.value !== score) {
    return NextResponse.json(
      { error: "That score isn't reachable from today's numbers." },
      { status: 400 },
    );
  }

  let entry;
  try {
    entry = await prisma.leaderboardEntry.create({
      data: {
        userId: session.user.id,
        score,
        target: puzzle.target,
        isDailyPuzzle: true,
        puzzleDate: date,
        timeTaken,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "You've already played today's Daily Puzzle." },
        { status: 409 },
      );
    }
    throw err;
  }

  const bestPossible = solve(puzzle.numbers, puzzle.target);
  const solutionSteps: Step[] = bestPossible?.value === puzzle.target ? bestPossible.steps : [];

  return NextResponse.json({
    score: entry.score,
    target: entry.target,
    difference: Math.abs(entry.score - entry.target),
    exact: entry.score === entry.target,
    timeTaken: entry.timeTaken,
    numbers: puzzle.numbers,
    solutionSteps,
    bestPossible: bestPossible?.value ?? null,
  });
}
