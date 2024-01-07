import { Composer } from "grammy";
import { fmt, bold } from "@grammyjs/parse-mode";

import { prisma } from "src/prisma";
import { initBot } from "src/discord/target/bot";

import { BotContext } from "./types";

export const addBotHandler = new Composer<BotContext>();

addBotHandler.command("add_bot", async (ctx) => {
  try {
    const [name, token] = ctx.match.split(" ");

    await ctx.replyWithChatAction("typing");

    const saved = await prisma.discordTargetBot.findFirst({
      where: {
        name,
      },
    });

    if (saved) {
      return ctx.replyFmt(fmt`Bot ${bold(name)} already added!`);
    }

    const targetBot = await prisma.discordTargetBot.create({
      data: {
        name,
        token,
      },
    });

    await initBot(targetBot.name);

    return ctx.replyFmt(fmt`Bot ${bold(name)} added!`);
  } catch (e) {
    console.error(e);
    ctx.reply("Unknown error!");
    return (
      typeof e === "object" &&
      e &&
      "message" in e &&
      typeof e.message === "string" &&
      ctx.reply(e.message)
    );
  }
});
