import { Composer } from "grammy";

import { prisma } from "src/prisma";
import { sendSummary, sendAllSummaries } from "src/discord/target/summary";

import { BotContext } from "./types";

export const aiHandler = new Composer<BotContext>();

aiHandler.command("ai", async (ctx) => {
  await ctx.replyWithChatAction("typing");
  const [channelName, channelId] = ctx.match.split(" ");

  const channel = await prisma.discordTargetChannel.findFirst({
    where: {
      name: channelName,
    },
  });

  if (!channel) {
    return ctx.reply("Channel not found!");
  }

  prisma.discordTargetChannel.update({
    where: {
      id: channel.id,
    },
    data: {
      summaryChannelId: channelId,
    },
  });

  await sendSummary(channel.id, new Date());
});

aiHandler.command("ai_ai_ai", async (ctx) => {
  await ctx.replyWithChatAction("typing");

  // for (let i = 0; i <= 6; i++) {
  //   await sendAllSummaries(subDays(new Date(), 7 - i));

  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  // }

  await sendAllSummaries();
});
