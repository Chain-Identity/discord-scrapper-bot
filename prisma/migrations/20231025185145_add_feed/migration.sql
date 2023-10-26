/*
  Warnings:

  - You are about to drop the column `summaryChannelId` on the `DiscordSourceChannel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiscordTargetChannel" ADD COLUMN "summaryChannelId" TEXT;

-- CreateTable
CREATE TABLE "DiscordSourceFeedChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiscordFeedConnector" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "discordTargetChannelId" TEXT NOT NULL,
    "discordSourceFeedChannelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscordFeedConnector_discordTargetChannelId_fkey" FOREIGN KEY ("discordTargetChannelId") REFERENCES "DiscordTargetChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscordFeedConnector_discordSourceFeedChannelId_fkey" FOREIGN KEY ("discordSourceFeedChannelId") REFERENCES "DiscordSourceFeedChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscordSourceChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "discordTargetChannelId" TEXT NOT NULL,
    CONSTRAINT "DiscordSourceChannel_discordTargetChannelId_fkey" FOREIGN KEY ("discordTargetChannelId") REFERENCES "DiscordTargetChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DiscordSourceChannel" ("createdAt", "discordTargetChannelId", "id", "name", "updatedAt") SELECT "createdAt", "discordTargetChannelId", "id", "name", "updatedAt" FROM "DiscordSourceChannel";
DROP TABLE "DiscordSourceChannel";
ALTER TABLE "new_DiscordSourceChannel" RENAME TO "DiscordSourceChannel";
CREATE UNIQUE INDEX "DiscordSourceChannel_discordTargetChannelId_key" ON "DiscordSourceChannel"("discordTargetChannelId");
CREATE TABLE "new_DiscordSourceMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "messageId" TEXT,
    "discordSourceChannelId" TEXT,
    "discordSourceFeedChannelId" TEXT,
    CONSTRAINT "DiscordSourceMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DiscordSourceMessage_discordSourceChannelId_fkey" FOREIGN KEY ("discordSourceChannelId") REFERENCES "DiscordSourceChannel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DiscordSourceMessage_discordSourceFeedChannelId_fkey" FOREIGN KEY ("discordSourceFeedChannelId") REFERENCES "DiscordSourceFeedChannel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DiscordSourceMessage" ("createdAt", "data", "discordSourceChannelId", "id", "messageId", "status", "type", "updatedAt") SELECT "createdAt", "data", "discordSourceChannelId", "id", "messageId", "status", "type", "updatedAt" FROM "DiscordSourceMessage";
DROP TABLE "DiscordSourceMessage";
ALTER TABLE "new_DiscordSourceMessage" RENAME TO "DiscordSourceMessage";
CREATE UNIQUE INDEX "DiscordSourceMessage_messageId_key" ON "DiscordSourceMessage"("messageId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "DiscordFeedConnector_discordTargetChannelId_key" ON "DiscordFeedConnector"("discordTargetChannelId");
