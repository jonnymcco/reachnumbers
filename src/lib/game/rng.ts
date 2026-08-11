/** Deterministic string -> 32-bit seed hash (djb2 variant). */
export function hashStringToSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Mulberry32 PRNG: fast, deterministic, good-enough distribution for a puzzle generator. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export function randomRng(): Rng {
  return Math.random;
}

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Fisher-Yates powered sample without replacement. */
export function sampleWithoutReplacement<T>(rng: Rng, pool: readonly T[], n: number): T[] {
  const copy = [...pool];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export function sampleWithReplacement<T>(rng: Rng, pool: readonly T[], n: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(pool[Math.floor(rng() * pool.length)]);
  }
  return result;
}
