/*
  Warnings:

  - Added the required column `discordTargetBotId` to the `DiscordTargetChannel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "DiscordTargetBot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscordTargetChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "summaryChannelId" TEXT,
    "discordTargetBotId" INTEGER NOT NULL,
    CONSTRAINT "DiscordTargetChannel_discordTargetBotId_fkey" FOREIGN KEY ("discordTargetBotId") REFERENCES "DiscordTargetBot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DiscordTargetChannel" ("createdAt", "id", "name", "summaryChannelId", "updatedAt") SELECT "createdAt", "id", "name", "summaryChannelId", "updatedAt" FROM "DiscordTargetChannel";
DROP TABLE "DiscordTargetChannel";
ALTER TABLE "new_DiscordTargetChannel" RENAME TO "DiscordTargetChannel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
