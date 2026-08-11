import {
  hashStringToSeed,
  mulberry32,
  randInt,
  randomRng,
  sampleWithoutReplacement,
  sampleWithReplacement,
  type Rng,
} from "./rng";

export const LARGE_POOL = [25, 50, 75, 100] as const;
export const SMALL_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const TOTAL_NUMBERS = 6;
export const TARGET_MIN = 100;
export const TARGET_MAX = 999;
export const MAX_LARGE_NUMBERS = 4;

export interface Puzzle {
  target: number;
  numbers: number[];
  numLarge: number;
}

function buildNumbers(rng: Rng, numLarge: number): number[] {
  const large = sampleWithoutReplacement(rng, LARGE_POOL, numLarge);
  const small = sampleWithReplacement(rng, SMALL_POOL, TOTAL_NUMBERS - numLarge);
  return [...large, ...small];
}

/** "Just Play!" puzzle: player picks how many large numbers to include. */
export function generateCasualPuzzle(numLarge: number): Puzzle {
  const clamped = Math.max(0, Math.min(MAX_LARGE_NUMBERS, Math.round(numLarge)));
  const rng = randomRng();
  const target = randInt(rng, TARGET_MIN, TARGET_MAX);
  const numbers = buildNumbers(rng, clamped);
  return { target, numbers, numLarge: clamped };
}

/** YYYY-MM-DD in UTC, used as the daily puzzle's stable identifier. */
export function todayDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Deterministic daily puzzle: everyone who plays on the same UTC calendar day
 * gets the identical target, large/small split, and number set.
 */
export function generateDailyPuzzle(dateString: string): Puzzle {
  const targetRng = mulberry32(hashStringToSeed(`reach-daily-target-${dateString}`));
  const target = randInt(targetRng, TARGET_MIN, TARGET_MAX);

  const largeCountRng = mulberry32(hashStringToSeed(`reach-daily-large-${dateString}`));
  const numLarge = randInt(largeCountRng, 0, MAX_LARGE_NUMBERS);

  const numbersRng = mulberry32(hashStringToSeed(`reach-daily-numbers-${dateString}`));
  const numbers = buildNumbers(numbersRng, numLarge);

  return { target, numbers, numLarge };
}
