"use client";

import { useState } from "react";
import { GameBoard } from "@/components/GameBoard";
import { SolutionDisplay } from "@/components/SolutionDisplay";
import { solve } from "@/lib/game/solver";
import type { Step } from "@/lib/game/engine";
import { generateCasualPuzzle, MAX_LARGE_NUMBERS } from "@/lib/game/generate";

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
}

export default function JustPlayPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [numLarge, setNumLarge] = useState(2);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const startGame = () => {
    setPuzzle(generateCasualPuzzle(numLarge));
    setResult(null);
    setPhase("playing");
  };

  const handleSubmit = ({ score, steps }: { score: number; steps: Step[] }) => {
    if (!puzzle) return;
    const best = solve(puzzle.numbers, puzzle.target);
    const solutionSteps = best?.value === puzzle.target ? best.steps : [];
    setResult({ score, playerSteps: steps, solutionSteps });
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
            <h1 className="text-3xl font-black text-foreground">Reach</h1>
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

          <button
            type="button"
            onClick={startGame}
            className="rounded-full px-8 py-3 font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            Start Puzzle
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
