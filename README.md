# Reach: The Numbers Puzzle

A numbers puzzle game (in the spirit of Countdown's numbers round): combine a set of
numbers with `+ − × ÷` to get as close as you can to a target, then play again.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode

No database, accounts, or server-side state — puzzle generation and the solver are
plain TypeScript that run entirely in the browser (`src/lib/game/`), so this is a
static, purely client-side app.

## Getting started

```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploying to Vercel

There's nothing to configure: [vercel.com/new](https://vercel.com/new) → import the
`reachnumbers` GitHub repo → pick the branch you want to deploy (doesn't have to be
`main`) → Deploy. No environment variables, no database.

## How the puzzle works

Pick how many "large" numbers (25/50/75/100, 0–4 of them) you want; the rest are
"small" numbers (1–10). Combine any two numbers with an operator to produce a new
number, and try to land on the target (100–999). Arithmetic rules: results must be
positive integers, subtraction is always larger-minus-smaller, and division only
succeeds when it divides evenly.

The core puzzle logic — number generation, arithmetic rules, and a brute-force solver
that finds an exact (or closest-possible) solution to show after you submit — lives in
`src/lib/game/`. It's plain TypeScript with no framework dependencies.

## Project layout

```
src/
  app/          # the single Just Play page (App Router)
  components/   # GameBoard, NumberTile, SolutionDisplay, Navbar, theme toggle
  lib/game/     # puzzle generation, arithmetic engine, and the solver
```
