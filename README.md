# Reach: The Numbers Puzzle

A numbers puzzle game (in the spirit of Countdown's numbers round): combine a set of
numbers with `+ − × ÷` to get as close as you can to a target. Play casually any time in
**Just Play!**, or take on the timed, once-a-day **Daily Puzzle** and compete on the
leaderboards.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Auth.js / NextAuth v5](https://authjs.dev) (credentials login, JWT sessions)
- [Prisma](https://www.prisma.io) + SQLite
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode

## Getting started

```bash
npm install                # also runs `prisma generate` via postinstall
cp .env.example .env       # set your own AUTH_SECRET for anything beyond local dev
npm run db:migrate         # creates prisma/dev.db and applies the schema
npm run dev                # http://localhost:3000
```

## How the puzzle works

- **Just Play!**: pick how many "large" numbers (25/50/75/100, 0–4 of them) you want;
  the rest are "small" numbers (1–10). Combine any two numbers with an operator to
  produce a new number, and try to land on the target (100–999). Guests can play; after
  3 games they're prompted to sign up so future scores save to the leaderboard.
- **Daily Puzzle**: everyone gets the same target and numbers each day, deterministically
  derived from the UTC date so the puzzle is stable across all players and requests.
  Requires login, is timed, and allows exactly one submission per day.
- Arithmetic rules: results must be positive integers, subtraction is always
  larger-minus-smaller, and division only succeeds when it divides evenly.

The core puzzle logic — number generation, the daily seed, arithmetic rules, and a
brute-force solver that finds an exact (or closest-possible) solution — lives in
`src/lib/game/`. It's plain TypeScript with no framework dependencies, so it runs
identically on the server (API routes, for validating submitted scores and generating
the answer key) and in the browser (the game board itself).

## Project layout

```
src/
  app/                  # pages + API routes (App Router)
  components/           # GameBoard, NumberTile, Navbar, AuthModal, etc.
  lib/game/             # generation, arithmetic engine, and the solver
  lib/prisma.ts         # Prisma client singleton
  auth.ts               # NextAuth config (credentials provider)
prisma/schema.prisma    # User + LeaderboardEntry models
```
