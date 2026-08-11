-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    "isDailyPuzzle" BOOLEAN NOT NULL DEFAULT false,
    "puzzleDate" TEXT,
    "timeTaken" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_isDailyPuzzle_puzzleDate_idx" ON "LeaderboardEntry"("isDailyPuzzle", "puzzleDate");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_userId_puzzleDate_key" ON "LeaderboardEntry"("userId", "puzzleDate");
