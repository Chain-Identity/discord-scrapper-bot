import { Composer } from "grammy";
import { fmt, bold, FormattedString } from "@grammyjs/parse-mode";
import { format } from 'date-fns'

import { prisma } from "src/prisma";

import { BotContext } from "./types";

export const lastMessagesHandler = new Composer<BotContext>();

lastMessagesHandler.command("last_messages", async (ctx) => {
  await ctx.replyWithChatAction("typing");

  const result: FormattedString[] = [];

  const messages = await prisma.message.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      discordTargetChannel: true,
      createdAt: true,
    },
    take: 10,
  });

  for (const message of messages) {
    result.push(fmt`- ${bold(message.discordTargetChannel?.name || '')} ${format(message.createdAt, 'dd.MM.yyyy HH:mm')}`);
  }

  return ctx.replyFmt(fmt(['', '\n\n', ...result.map(() => '\n'), ''], `Last 10 messages:`, ...result));
});
