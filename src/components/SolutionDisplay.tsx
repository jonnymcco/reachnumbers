import type { Step } from "@/lib/game/engine";
import { formatStep } from "@/lib/game/engine";
import { NumberTile } from "./NumberTile";
import { LARGE_POOL } from "@/lib/game/generate";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function SolutionDisplay({
  target,
  numbers,
  score,
  playerSteps,
  solutionSteps,
  timeTaken,
}: {
  target: number;
  numbers: number[];
  score: number;
  playerSteps?: Step[];
  solutionSteps?: Step[];
  timeTaken?: number;
}) {
  const difference = Math.abs(score - target);
  const exact = difference === 0;

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-foreground-muted">
          {exact ? "Perfect!" : "Result"}
        </p>
        <p className="text-5xl font-black tabular-nums mt-1 text-foreground">{score}</p>
        <p className={`mt-1 font-medium ${exact ? "text-success" : "text-foreground-muted"}`}>
          {exact ? "Exact match! 🎯" : `Off by ${difference} (target was ${target})`}
        </p>
        {typeof timeTaken === "number" && (
          <p className="mt-1 text-sm text-foreground-muted">Time: {formatTime(timeTaken)}</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-2">
          Your numbers
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {numbers.map((n, i) => (
            <NumberTile
              key={i}
              value={n}
              origin={(LARGE_POOL as readonly number[]).includes(n) ? "large" : "small"}
            />
          ))}
        </div>
      </div>

      {playerSteps && playerSteps.length > 0 && (
        <div className="w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-2 text-center">
            Your working
          </p>
          <ol className="space-y-1 text-sm text-foreground bg-surface-muted rounded-xl p-3">
            {playerSteps.map((s, i) => (
              <li key={i} className="tabular-nums">
                {i + 1}. {formatStep(s)}
              </li>
            ))}
          </ol>
        </div>
      )}

      {solutionSteps && solutionSteps.length > 0 && (
        <div className="w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-2 text-center">
            One possible exact solution
          </p>
          <ol className="space-y-1 text-sm text-foreground bg-surface-muted rounded-xl p-3">
            {solutionSteps.map((s, i) => (
              <li key={i} className="tabular-nums">
                {i + 1}. {formatStep(s)}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
