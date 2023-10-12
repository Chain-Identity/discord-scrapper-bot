import { Composer } from "grammy";
import { fmt, bold } from "@grammyjs/parse-mode";

import { getChannelByName, syncChannel } from "src/discord/source";
import { addChannel } from "src/discord/target";
import { prisma } from "src/prisma";

import { BotContext } from "./types";

export const addChannelHandler = new Composer<BotContext>();

addChannelHandler.command("add_channel", async (ctx) => {
  try {
    const channelName = ctx.match;

    await ctx.replyWithChatAction("typing");

    const channel = getChannelByName(channelName);

    if (!channel) {
      return ctx.reply("Channel not found!");
    }

    const savedChannel = await prisma.discordSourceChannel.findFirst({
      where: {
        id: channel.id,
      },
    });

    if (savedChannel) {
      return ctx.replyFmt(
        fmt`Channel ${bold(savedChannel.name)} (${
          savedChannel.id
        }) already added!`
      );
    }

    const targetName = `${channel.name!}`;

    const newChannel = await addChannel({
      name: targetName,
    });

    await prisma.discordSourceChannel.create({
      data: {
        id: channel.id,
        name: channel.name!,
        discordTargetChannelId: newChannel.id,
      },
    });

    await syncChannel(channel.id);

    return ctx.replyFmt(
      fmt`Channel ${bold("#" + targetName)} (${newChannel.id}) added!`
    );
  } catch (e) {
    console.error(e);
    ctx.reply("Unknown error!");
    return typeof e === "object" &&
      e &&
      "message" in e &&
      typeof e.message === "string" &&
      ctx.reply(e.message);
  }
});
