# Reach: The Numbers Puzzle

A numbers puzzle game (in the spirit of Countdown's numbers round): combine a set of
numbers with `+ − × ÷` to get as close as you can to a target. Play casually any time in
**Just Play!**, or take on the timed, once-a-day **Daily Puzzle** and compete on the
leaderboards.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Auth.js / NextAuth v5](https://authjs.dev) (credentials login, JWT sessions)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode

## Getting started

You need a Postgres database to point at — a free [Neon](https://neon.tech) or
[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) database works well,
or run one locally (`createdb reachnumbers` with a local Postgres install, or
`docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16`).

```bash
npm install                # also runs `prisma generate` via postinstall
cp .env.example .env       # fill in DATABASE_URL and a real AUTH_SECRET
npm run db:migrate         # applies the schema to your database
npm run dev                # http://localhost:3000
```

## Deploying to Vercel

1. **Push this repo to GitHub** (already done if you're reading this from the repo).
2. **Import the project in Vercel**: [vercel.com/new](https://vercel.com/new) → select
   the `reachnumbers` GitHub repo → pick the branch you want to deploy (doesn't have to
   be `main` — Vercel can deploy any branch, either as a Preview or by changing the
   Production branch in project settings).
3. **Add a Postgres database**: in the new project, go to the **Storage** tab → *Create
   Database* → Postgres. This provisions a Neon-backed Postgres and automatically sets
   the `DATABASE_URL` env var for you — no separate account needed.
4. **Add the `AUTH_SECRET` env var**: Project Settings → Environment Variables → add
   `AUTH_SECRET` with a long random value (e.g. `openssl rand -base64 32`).
5. **Deploy.** The build script (`prisma migrate deploy && next build`) applies the
   schema to your new database automatically on every deploy, so there's no separate
   migration step to run by hand.

That's it — Vercel auto-detects Next.js, so no custom build/output settings are needed
beyond the two env vars above.

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
