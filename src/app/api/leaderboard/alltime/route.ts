import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ExactRow {
  userId: string;
  exactCount: bigint | number;
}

export async function GET() {
  const exactRows = await prisma.$queryRaw<ExactRow[]>`
    SELECT "userId", COUNT(*) as "exactCount"
    FROM "LeaderboardEntry"
    WHERE "isDailyPuzzle" = true AND "score" = "target"
    GROUP BY "userId"
  `;

  const casualRows = await prisma.leaderboardEntry.groupBy({
    by: ["userId"],
    where: { isDailyPuzzle: false },
    _count: { _all: true },
  });

  const userIds = new Set<string>([
    ...exactRows.map((r) => r.userId),
    ...casualRows.map((r) => r.userId),
  ]);

  if (userIds.size === 0) {
    return NextResponse.json({ entries: [] });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
    select: { id: true, name: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.name]));
  const exactById = new Map(exactRows.map((r) => [r.userId, Number(r.exactCount)]));
  const casualById = new Map(casualRows.map((r) => [r.userId, r._count._all]));

  const rows = [...userIds]
    .map((userId) => ({
      name: nameById.get(userId) ?? "Unknown",
      exactDailyChallenges: exactById.get(userId) ?? 0,
      casualGames: casualById.get(userId) ?? 0,
    }))
    .sort((a, b) => {
      if (a.exactDailyChallenges !== b.exactDailyChallenges) {
        return b.exactDailyChallenges - a.exactDailyChallenges;
      }
      return b.casualGames - a.casualGames;
    })
    .slice(0, 50)
    .map((row, i) => ({ rank: i + 1, ...row }));

  return NextResponse.json({ entries: rows });
}
