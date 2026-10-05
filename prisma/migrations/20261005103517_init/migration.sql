-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "pc" INTEGER NOT NULL DEFAULT 0,
    "pg" INTEGER NOT NULL DEFAULT 0,
    "ntw" INTEGER NOT NULL DEFAULT 0,
    "ntr" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "titlePoints" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "runnerUpPoints" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "tieBreakOrder" TEXT NOT NULL DEFAULT '["tpct","ntw","apct","pc"]',
    "minMatches" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ScoringConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_team_league_key" ON "Team"("team", "league");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
