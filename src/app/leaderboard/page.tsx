"use client";

import { useEffect, useState } from "react";

type Tab = "daily" | "alltime";

interface DailyRow {
  rank: number;
  name: string;
  score: number;
  target: number;
  difference: number;
  timeTaken: number;
}

interface AllTimeRow {
  rank: number;
  name: string;
  exactDailyChallenges: number;
  casualGames: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const [dailyRows, setDailyRows] = useState<DailyRow[] | null>(null);
  const [allTimeRows, setAllTimeRows] = useState<AllTimeRow[] | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard/daily")
      .then((r) => r.json())
      .then((d) => setDailyRows(d.entries));
    fetch("/api/leaderboard/alltime")
      .then((r) => r.json())
      .then((d) => setAllTimeRows(d.entries));
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="text-3xl font-black text-foreground">Leaderboard</h1>

      <div className="flex gap-1 rounded-lg bg-surface-muted p-1">
        <TabButton active={tab === "daily"} onClick={() => setTab("daily")}>
          Today&apos;s Puzzle
        </TabButton>
        <TabButton active={tab === "alltime"} onClick={() => setTab("alltime")}>
          All-Time Best
        </TabButton>
      </div>

      <div className="w-full max-w-lg">
        {tab === "daily" ? (
          <DailyTable rows={dailyRows} />
        ) : (
          <AllTimeTable rows={allTimeRows} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
        active ? "bg-surface text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function DailyTable({ rows }: { rows: DailyRow[] | null }) {
  if (!rows) return <TableLoading />;
  if (rows.length === 0) return <EmptyState>No one has played today&apos;s puzzle yet.</EmptyState>;

  return (
    <table className="w-full text-sm border-separate border-spacing-y-1">
      <thead>
        <tr className="text-left text-xs uppercase tracking-widest text-foreground-muted">
          <th className="px-3 py-2 w-10">#</th>
          <th className="px-3 py-2">Player</th>
          <th className="px-3 py-2 text-right">Score</th>
          <th className="px-3 py-2 text-right">Time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.rank} className="bg-surface">
            <td className="px-3 py-2.5 rounded-l-xl font-semibold text-foreground-muted">{row.rank}</td>
            <td className="px-3 py-2.5 text-foreground font-medium truncate max-w-[10rem]">{row.name}</td>
            <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
              {row.score}
              {row.difference === 0 && <span className="text-success ml-1">🎯</span>}
            </td>
            <td className="px-3 py-2.5 rounded-r-xl text-right tabular-nums text-foreground-muted">
              {formatTime(row.timeTaken)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AllTimeTable({ rows }: { rows: AllTimeRow[] | null }) {
  if (!rows) return <TableLoading />;
  if (rows.length === 0) return <EmptyState>No games played yet — be the first!</EmptyState>;

  return (
    <table className="w-full text-sm border-separate border-spacing-y-1">
      <thead>
        <tr className="text-left text-xs uppercase tracking-widest text-foreground-muted">
          <th className="px-3 py-2 w-10">#</th>
          <th className="px-3 py-2">Player</th>
          <th className="px-3 py-2 text-right">Exact Dailies</th>
          <th className="px-3 py-2 text-right">Casual Games</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.rank} className="bg-surface">
            <td className="px-3 py-2.5 rounded-l-xl font-semibold text-foreground-muted">{row.rank}</td>
            <td className="px-3 py-2.5 text-foreground font-medium truncate max-w-[10rem]">{row.name}</td>
            <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
              {row.exactDailyChallenges}
            </td>
            <td className="px-3 py-2.5 rounded-r-xl text-right tabular-nums text-foreground-muted">
              {row.casualGames}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TableLoading() {
  return <p className="text-center text-foreground-muted py-8">Loading…</p>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-foreground-muted py-8">{children}</p>;
}
