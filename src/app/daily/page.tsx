"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { GameBoard } from "@/components/GameBoard";
import { SolutionDisplay } from "@/components/SolutionDisplay";
import { Timer } from "@/components/Timer";
import { useAuthModal } from "@/components/AuthModalContext";
import type { Step } from "@/lib/game/engine";

interface DailyPuzzle {
  date: string;
  target: number;
  numbers: number[];
  numLarge: number;
  alreadyPlayed: boolean;
  previousResult: { score: number; timeTaken: number | null; difference: number } | null;
}

interface Result {
  score: number;
  target: number;
  difference: number;
  exact: boolean;
  timeTaken: number;
  numbers: number[];
  solutionSteps: Step[];
}

export default function DailyPuzzlePage() {
  const { status } = useSession();
  const { openModal } = useAuthModal();

  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const elapsedRef = useRef(0);

  const loading = status === "loading" || (status === "authenticated" && !puzzle && !error);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/game/daily");
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setPuzzle(data);
        if (!data.alreadyPlayed) setTimerRunning(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleSubmit = async ({ score, steps }: { score: number; steps: Step[] }) => {
    if (!puzzle) return;
    setTimerRunning(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/daily/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, timeTaken: elapsedRef.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult({ ...data, numbers: puzzle.numbers });
      void steps;
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }

  if (status !== "authenticated") {
    return (
      <CenteredMessage>
        <h1 className="text-2xl font-black text-foreground mb-2">Daily Puzzle</h1>
        <p className="text-foreground-muted mb-6">
          Log in to play today&apos;s puzzle — one attempt per day, timed and ranked on the
          leaderboard.
        </p>
        <button
          type="button"
          onClick={() => openModal("Log in to play the Daily Puzzle.")}
          className="rounded-full px-8 py-3 font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
        >
          Sign up / Log in
        </button>
      </CenteredMessage>
    );
  }

  if (error) {
    return <CenteredMessage>{error}</CenteredMessage>;
  }

  if (!puzzle) {
    return <CenteredMessage>Something went wrong. Please refresh.</CenteredMessage>;
  }

  if (puzzle.alreadyPlayed && !result) {
    return (
      <CenteredMessage>
        <h1 className="text-2xl font-black text-foreground mb-2">You&apos;ve already played today!</h1>
        {puzzle.previousResult && (
          <p className="text-foreground-muted mb-6">
            Your score: <span className="font-semibold text-foreground">{puzzle.previousResult.score}</span>{" "}
            (off by {puzzle.previousResult.difference})
          </p>
        )}
        <Link
          href="/leaderboard"
          className="rounded-full px-8 py-3 font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer inline-block"
        >
          View Leaderboard
        </Link>
      </CenteredMessage>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-6">
      {!result && (
        <>
          <div className="flex items-center gap-2 text-foreground-muted">
            <span className="text-xs font-semibold uppercase tracking-widest">Time</span>
            <Timer
              running={timerRunning}
              onTick={(s) => {
                elapsedRef.current = s;
              }}
            />
          </div>
          <GameBoard
            target={puzzle.target}
            numbers={puzzle.numbers}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </>
      )}

      {result && (
        <>
          <SolutionDisplay
            target={result.target}
            numbers={result.numbers}
            score={result.score}
            timeTaken={result.timeTaken}
            solutionSteps={result.solutionSteps}
          />
          <Link
            href="/leaderboard"
            className="rounded-full px-8 py-3 font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            View Leaderboard
          </Link>
        </>
      )}
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center">
      {children}
    </div>
  );
}
