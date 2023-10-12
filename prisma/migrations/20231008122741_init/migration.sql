-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "discordTargetChannelId" TEXT NOT NULL,
    CONSTRAINT "Message_discordTargetChannelId_fkey" FOREIGN KEY ("discordTargetChannelId") REFERENCES "DiscordTargetChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordSourceMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "discordSourceChannelId" TEXT NOT NULL,
    "messageId" TEXT,
    CONSTRAINT "DiscordSourceMessage_discordSourceChannelId_fkey" FOREIGN KEY ("discordSourceChannelId") REFERENCES "DiscordSourceChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscordSourceMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordTargetChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiscordSourceChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "summaryChannelId" TEXT,
    "discordTargetChannelId" TEXT NOT NULL,
    CONSTRAINT "DiscordSourceChannel_discordTargetChannelId_fkey" FOREIGN KEY ("discordTargetChannelId") REFERENCES "DiscordTargetChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordSourceMessage_messageId_key" ON "DiscordSourceMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordSourceChannel_discordTargetChannelId_key" ON "DiscordSourceChannel"("discordTargetChannelId");
