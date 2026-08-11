import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayDateString } from "@/lib/game/generate";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? todayDateString();

  const entries = await prisma.leaderboardEntry.findMany({
    where: { isDailyPuzzle: true, puzzleDate: date },
    include: { user: { select: { name: true } } },
    orderBy: [{ timeTaken: "asc" }, { createdAt: "asc" }],
    take: 100,
  });

  const rows = entries
    .map((e) => ({
      name: e.user.name,
      score: e.score,
      target: e.target,
      difference: Math.abs(e.score - e.target),
      timeTaken: e.timeTaken ?? 0,
    }))
    .sort((a, b) => {
      if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
      return a.difference - b.difference;
    })
    .slice(0, 50)
    .map((row, i) => ({ rank: i + 1, ...row }));

  return NextResponse.json({ date, entries: rows });
}
