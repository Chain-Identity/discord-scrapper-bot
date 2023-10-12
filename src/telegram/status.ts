import { Composer } from "grammy";
import { fmt, bold, FormattedString } from "@grammyjs/parse-mode";

import { messageQ } from "src/discord/target";
import { prisma } from "src/prisma";

import { BotContext } from "./types";
import { MessageStatus } from "src/types/message";

export const statusHandler = new Composer<BotContext>();

statusHandler.command("status", async (ctx) => {
  await ctx.replyWithChatAction("typing");

  const channels = await prisma.discordSourceChannel.findMany();

  const result: FormattedString[] = [];

  for (const channel of channels) {
    const sourceChannelMessages = await prisma.discordSourceMessage.count({
      where: { discordSourceChannelId: channel.id },
    });
    const targetChannelMessages = await prisma.message.count({
      where: { discordTargetChannelId: channel.discordTargetChannelId },
    });
    const errorMessages = await prisma.discordSourceMessage.count({
      where: {
        discordSourceChannelId: channel.id,
        status: MessageStatus.error,
      },
    });

    const isDone = (sourceChannelMessages - errorMessages) === (targetChannelMessages);

    const str = fmt`${isDone ? `✅` : `⏳`} ${bold(channel.name)} ${
      isDone
        ? ` ${sourceChannelMessages}`
        : ` ${targetChannelMessages}/${sourceChannelMessages}`
    } ${errorMessages ? ` (${errorMessages})` : ``}`;

    if (isDone) {
      result.push(str);
    } else {
      result.unshift(str);
    }
  }

  return ctx.replyFmt(fmt(['', '\n\n', ...result.map(() => '\n'), ''], `queue size: ${bold(messageQ.length())}`, ...result));
});
