"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { GameBoard } from "@/components/GameBoard";
import { SolutionDisplay } from "@/components/SolutionDisplay";
import { useAuthModal } from "@/components/AuthModalContext";
import { solve } from "@/lib/game/solver";
import type { Step } from "@/lib/game/engine";
import { MAX_LARGE_NUMBERS } from "@/lib/game/generate";
import { getGuestGamesPlayed, incrementGuestGamesPlayed, GUEST_GAME_LIMIT } from "@/lib/guestTracker";

type Phase = "setup" | "playing" | "result";

interface Puzzle {
  target: number;
  numbers: number[];
  numLarge: number;
}

interface Result {
  score: number;
  playerSteps: Step[];
  solutionSteps: Step[];
  saved: boolean;
}

export default function JustPlayPage() {
  const { status } = useSession();
  const { openModal } = useAuthModal();

  const [phase, setPhase] = useState<Phase>("setup");
  const [numLarge, setNumLarge] = useState(2);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestGamesPlayed, setGuestGamesPlayed] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available after mount
    setGuestGamesPlayed(getGuestGamesPlayed());
  }, []);

  const startGame = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/game/casual?numLarge=${numLarge}`);
      const data = await res.json();
      setPuzzle(data);
      setResult(null);
      setPhase("playing");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async ({ score, steps }: { score: number; steps: Step[] }) => {
    if (!puzzle) return;
    const best = solve(puzzle.numbers, puzzle.target);
    const solutionSteps = best?.value === puzzle.target ? best.steps : [];

    let saved = false;
    if (status === "authenticated") {
      const res = await fetch("/api/game/casual/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, target: puzzle.target, numbers: puzzle.numbers }),
      });
      saved = res.ok;
    } else {
      const played = incrementGuestGamesPlayed();
      setGuestGamesPlayed(played);
      if (played >= GUEST_GAME_LIMIT) {
        setTimeout(() => openModal("Sign up to save your scores to the global leaderboard!"), 800);
      }
    }

    setResult({ score, playerSteps: steps, solutionSteps, saved });
    setPhase("result");
  };

  const playAgain = () => {
    setPhase("setup");
    setPuzzle(null);
    setResult(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-8">
      {phase === "setup" && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <div>
            <h1 className="text-3xl font-black text-foreground">Just Play!</h1>
            <p className="text-foreground-muted mt-2">
              Pick a target, combine numbers with +, −, ×, ÷ and get as close as you can. No time
              limit.
            </p>
          </div>

          <div className="w-full">
            <p className="text-sm font-medium text-foreground-muted mb-2">
              How many large numbers? (25, 50, 75, 100)
            </p>
            <div className="flex justify-center gap-2">
              {Array.from({ length: MAX_LARGE_NUMBERS + 1 }, (_, i) => i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumLarge(n)}
                  className={`h-11 w-11 rounded-full font-semibold border transition-colors cursor-pointer ${
                    numLarge === n
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-foreground-muted hover:border-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {status !== "authenticated" && guestGamesPlayed > 0 && (
            <p className="text-xs text-foreground-muted">
              Guest games played: {guestGamesPlayed} / {GUEST_GAME_LIMIT}
            </p>
          )}

          <button
            type="button"
            onClick={startGame}
            disabled={loading}
            className="rounded-full px-8 py-3 font-semibold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
          >
            {loading ? "Generating…" : "Start Puzzle"}
          </button>
        </div>
      )}

      {phase === "playing" && puzzle && (
        <GameBoard target={puzzle.target} numbers={puzzle.numbers} onSubmit={handleSubmit} />
      )}

      {phase === "result" && puzzle && result && (
        <>
          <SolutionDisplay
            target={puzzle.target}
            numbers={puzzle.numbers}
            score={result.score}
            playerSteps={result.playerSteps}
            solutionSteps={result.solutionSteps}
          />
          <button
            type="button"
            onClick={playAgain}
            className="rounded-full px-8 py-3 font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            Play Again
          </button>
        </>
      )}
    </div>
  );
}
