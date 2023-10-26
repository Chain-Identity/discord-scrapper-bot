import { Composer } from "grammy";
import { fmt, bold } from "@grammyjs/parse-mode";

import { getChannelByName, getFeedByName, syncChannel, syncFeedChannel } from "src/discord/source";
import { addChannel, syncTargetChannelFromFeed } from "src/discord/target";
import { prisma } from "src/prisma";

import { BotContext } from "./types";

export const addChannelHandler = new Composer<BotContext>();

addChannelHandler.command("add_channel", async (ctx) => {
  try {
    const [channelName, param] = ctx.match.split(" ");

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

    await syncChannel(channel.id, undefined, param === 'short');

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

addChannelHandler.command("add_feed", async (ctx) => {
  try {
    const feedName = ctx.match;

    await ctx.replyWithChatAction("typing");

    const feedChannel = getFeedByName(feedName);

    if (!feedChannel) {
      return ctx.reply("Channel not found!");
    }

    const savedChannel = await prisma.discordSourceFeedChannel.findFirst({
      where: {
        id: feedChannel.id,
      },
    });

    if (savedChannel) {
      return ctx.replyFmt(
        fmt`Feed ${bold(savedChannel.name)} (${
          savedChannel.id
        }) already added!`
      );
    }

    await prisma.discordSourceFeedChannel.create({
      data: {
        id: feedChannel.id,
        name: feedChannel.name!,
      },
    });

    await syncFeedChannel(feedChannel.id);

    return ctx.replyFmt(
      fmt`Feed ${bold("#" + feedChannel.name!)} (${feedChannel.id}) added!`
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


addChannelHandler.command("add_feed_channel", async (ctx) => {
  try {
    const [feedName, channelName, ...nameList] = ctx.match.split(" ");
    const name = nameList.join(" ");

    await ctx.replyWithChatAction("typing");

    const feedChannel = getFeedByName(feedName);

    if (!feedChannel) {
      return ctx.reply("Channel not found!");
    }

    const feedSourceChannel = await prisma.discordSourceFeedChannel.findFirst({
      where: {
        id: feedChannel.id,
      },
    });

    if (!feedSourceChannel) {
      return ctx.reply("Feed not found!");
    }

    const message = await prisma.discordSourceMessage.findFirst({
      where: {
        name: name,
      },
    });

    if (!message) {
      return ctx.reply(`Message with name "${name}" not found!`);
    }

    const newChannel = await addChannel({
      name: channelName,
    });

    const connector = await prisma.discordFeedConnector.create({
      data: {
        discordSourceFeedChannelId: feedSourceChannel.id,
        discordTargetChannelId: newChannel.id,
        name: name,
      },
    });

    await syncTargetChannelFromFeed(connector.id);

    return ctx.replyFmt(
      fmt`In feed ${bold(feedChannel.name!)} added channel ${bold(name)}!`
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
