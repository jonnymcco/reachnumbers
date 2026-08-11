import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateDailyPuzzle, todayDateString } from "@/lib/game/generate";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to play the Daily Puzzle." },
      { status: 401 },
    );
  }

  const date = todayDateString();
  const puzzle = generateDailyPuzzle(date);

  const existing = await prisma.leaderboardEntry.findUnique({
    where: { userId_puzzleDate: { userId: session.user.id, puzzleDate: date } },
  });

  return NextResponse.json({
    date,
    target: puzzle.target,
    numbers: puzzle.numbers,
    numLarge: puzzle.numLarge,
    alreadyPlayed: Boolean(existing),
    previousResult: existing
      ? {
          score: existing.score,
          timeTaken: existing.timeTaken,
          difference: Math.abs(existing.score - existing.target),
        }
      : null,
  });
}
