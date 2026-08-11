import { applyOp, OPERATORS, type Step } from "./engine";

interface SolverNumber {
  value: number;
  steps: Step[];
}

export interface SolverResult {
  value: number;
  steps: Step[];
}

/**
 * Brute-force search over every way to combine the given numbers with +-x/,
 * returning the value closest to the target (exact match if one exists) along
 * with one worked path that achieves it. Mirrors the classic Countdown numbers
 * game solver: any subset of the numbers may be used, not just all six.
 */
export function solve(numbers: number[], target: number): SolverResult | null {
  let best: SolverResult | null = null;

  const consider = (candidate: SolverResult) => {
    if (best === null) {
      best = candidate;
      return;
    }
    const bestDiff = Math.abs(best.value - target);
    const candidateDiff = Math.abs(candidate.value - target);
    if (
      candidateDiff < bestDiff ||
      (candidateDiff === bestDiff && candidate.steps.length < best.steps.length)
    ) {
      best = candidate;
    }
  };

  const recurse = (items: SolverNumber[]) => {
    for (const item of items) consider(item);
    if (best !== null && (best as SolverResult).value === target) return;
    if (items.length < 2) return;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const rest = items.filter((_, idx) => idx !== i && idx !== j);

        for (const op of OPERATORS) {
          const applied = applyOp(a.value, b.value, op);
          if (!applied) continue;

          const step: Step = { left: applied.left, right: applied.right, op, result: applied.result };
          const nextItem: SolverNumber = {
            value: applied.result,
            steps: [...a.steps, ...b.steps, step],
          };
          recurse([...rest, nextItem]);

          if (best !== null && (best as SolverResult).value === target) return;
        }
      }
    }
  };

  recurse(numbers.map((value) => ({ value, steps: [] })));
  return best;
}
