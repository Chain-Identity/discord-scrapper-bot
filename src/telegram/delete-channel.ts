import { Composer } from "grammy";

import { getChannelById } from "src/discord/source";
import { activeChannelSet } from "src/discord/source/bot";
import { prisma } from "src/prisma";

import { BotContext } from "./types";

export const deleteChannelHandler = new Composer<BotContext>();

deleteChannelHandler.command("delete_channel", async (ctx) => {
  try {
    const channelId = ctx.match;

    await ctx.replyWithChatAction("typing");

    const channel = getChannelById(channelId);

    if (!channel) {
      return ctx.reply("Channel not found!");
    }

    activeChannelSet.delete(channel.id);

    const savedSourceChannel = await prisma.discordSourceChannel.findUnique({
      where: {
        id: channel.id,
      },
    });

    if (!savedSourceChannel) {
      return ctx.reply("Channel not found!");
    }

    const savedTargetChannel = await prisma.discordTargetChannel.findUnique({
      where: {
        id: savedSourceChannel.discordTargetChannelId,
      },
    });

    if (!savedTargetChannel) {
      return ctx.reply("Channel not found!");
    }

    const messages = await prisma.message.findMany({
      where: {
        discordTargetChannelId: savedTargetChannel.id,
      },
    });

    await prisma.message.deleteMany({
      where: {
        id: {
          in: messages.map((message) => message.id),
        },
      },
    });

    const sourceMessages = await prisma.discordSourceMessage.findMany({
      where: {
        discordSourceChannelId: savedSourceChannel.id,
      },
    });

    await prisma.discordSourceMessage.deleteMany({
      where: {
        id: {
          in: sourceMessages.map((message) => message.id),
        },
      },
    });

    await prisma.discordSourceChannel.delete({
      where: {
        id: savedSourceChannel.id,
      },
    });

    await prisma.discordTargetChannel.delete({
      where: {
        id: savedSourceChannel.discordTargetChannelId,
      },
    });

    return ctx.reply("Channel deleted!");
  } catch (e) {
    console.error(e);
    ctx.reply("Unknown Error");
    return (
      typeof e === "object" &&
      e &&
      "message" in e &&
      typeof e.message === "string" &&
      ctx.reply(e.message)
    );
  }
});
