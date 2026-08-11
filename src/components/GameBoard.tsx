"use client";

import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { applyOp, canApplyOp, OPERATORS, type Op, type Step } from "@/lib/game/engine";
import { LARGE_POOL } from "@/lib/game/generate";
import { NumberTile } from "./NumberTile";

interface Tile {
  id: string;
  value: number;
  origin: "large" | "small" | "derived";
}

const OP_LABELS: Record<Op, string> = { "+": "+", "-": "−", "×": "×", "÷": "÷" };

function makeInitialTiles(numbers: number[]): Tile[] {
  return numbers.map((value) => ({
    id: uuid(),
    value,
    origin: (LARGE_POOL as readonly number[]).includes(value) ? "large" : "small",
  }));
}

export function GameBoard({
  target,
  numbers,
  onSubmit,
  submitting = false,
}: {
  target: number;
  numbers: number[];
  onSubmit: (result: { score: number; steps: Step[] }) => void;
  submitting?: boolean;
}) {
  const initial = useMemo(() => makeInitialTiles(numbers), [numbers]);
  const [tiles, setTiles] = useState<Tile[]>(initial);
  const [history, setHistory] = useState<{ tiles: Tile[]; steps: Step[] }[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const best = useMemo(
    () => tiles.reduce((a, b) => (Math.abs(b.value - target) < Math.abs(a.value - target) ? b : a)),
    [tiles, target],
  );
  const diff = Math.abs(best.value - target);

  const selectedTiles = tiles.filter((t) => selected.includes(t.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleOp = (op: Op) => {
    if (selectedTiles.length !== 2) return;
    const [a, b] = selectedTiles;
    const applied = applyOp(a.value, b.value, op);
    if (!applied) return;

    const step: Step = { left: applied.left, right: applied.right, op, result: applied.result };
    const nextTiles: Tile[] = [
      ...tiles.filter((t) => t.id !== a.id && t.id !== b.id),
      { id: uuid(), value: applied.result, origin: "derived" },
    ];

    setHistory((h) => [...h, { tiles, steps }]);
    setTiles(nextTiles);
    setSteps((s) => [...s, step]);
    setSelected([]);
  };

  const handleUndo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setTiles(last.tiles);
      setSteps(last.steps);
      setSelected([]);
      return h.slice(0, -1);
    });
  };

  const handleReset = () => {
    setTiles(initial);
    setHistory([]);
    setSteps([]);
    setSelected([]);
  };

  const handleSubmit = () => {
    onSubmit({ score: best.value, steps });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
          Target
        </span>
        <span className="text-5xl sm:text-6xl font-black tabular-nums text-foreground">{target}</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm text-foreground-muted">
          Current best: <span className="font-semibold text-foreground tabular-nums">{best.value}</span>
        </span>
        <span className={`text-sm font-medium ${diff === 0 ? "text-success" : "text-foreground-muted"}`}>
          {diff === 0 ? "Exact! 🎯" : `Off by ${diff}`}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-md">
        {tiles.map((t) => (
          <NumberTile
            key={t.id}
            value={t.value}
            origin={t.origin}
            selected={selected.includes(t.id)}
            disabled={submitting}
            onClick={() => toggleSelect(t.id)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {OPERATORS.map((op) => {
          const enabled =
            selectedTiles.length === 2 &&
            canApplyOp(selectedTiles[0].value, selectedTiles[1].value, op) &&
            !submitting;
          return (
            <button
              key={op}
              type="button"
              disabled={!enabled}
              onClick={() => handleOp(op)}
              className={`h-12 w-12 rounded-full text-xl font-bold border transition-colors ${
                enabled
                  ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  : "border-border text-foreground-muted/40 cursor-not-allowed"
              }`}
            >
              {OP_LABELS[op]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleUndo}
          disabled={history.length === 0 || submitting}
          className="rounded-full px-4 py-2 text-sm font-medium border border-border text-foreground-muted disabled:opacity-40 hover:text-foreground hover:border-accent transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={history.length === 0 || submitting}
          className="rounded-full px-4 py-2 text-sm font-medium border border-border text-foreground-muted disabled:opacity-40 hover:text-foreground hover:border-accent transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full px-6 py-2 text-sm font-semibold bg-accent text-accent-foreground disabled:opacity-60 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {submitting ? "Submitting…" : "Submit Result"}
        </button>
      </div>
    </div>
  );
}
