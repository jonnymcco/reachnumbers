export type Op = "+" | "-" | "×" | "÷";

export const OPERATORS: Op[] = ["+", "-", "×", "÷"];

export interface OpResult {
  result: number;
  left: number;
  right: number;
}

/**
 * Applies an operation to two numbers, enforcing the puzzle's arithmetic rules:
 * results must be positive integers, subtraction is always larger-minus-smaller,
 * and division only succeeds when it divides evenly.
 */
export function applyOp(x: number, y: number, op: Op): OpResult | null {
  switch (op) {
    case "+":
      return { result: x + y, left: x, right: y };
    case "×":
      return { result: x * y, left: x, right: y };
    case "-": {
      if (x === y) return null;
      const left = Math.max(x, y);
      const right = Math.min(x, y);
      return { result: left - right, left, right };
    }
    case "÷": {
      const left = Math.max(x, y);
      const right = Math.min(x, y);
      if (right === 0) return null;
      if (left % right !== 0) return null;
      return { result: left / right, left, right };
    }
  }
}

export function canApplyOp(x: number, y: number, op: Op): boolean {
  return applyOp(x, y, op) !== null;
}

export interface Tile {
  id: string;
  value: number;
}

export interface Step {
  left: number;
  right: number;
  op: Op;
  result: number;
}

export function formatStep(step: Step): string {
  return `${step.left} ${step.op} ${step.right} = ${step.result}`;
}

export function closestScore(numbers: number[], target: number): number {
  let best = numbers[0];
  for (const n of numbers) {
    if (Math.abs(n - target) < Math.abs(best - target)) best = n;
  }
  return best;
}
