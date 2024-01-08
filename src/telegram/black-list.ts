import { Composer } from "grammy";
import { fmt, bold } from "@grammyjs/parse-mode";

import { prisma } from "src/prisma";
import { initBlackList } from "src/discord/source/black-list";

import { BotContext } from "./types";

export const blackListHandler = new Composer<BotContext>();

blackListHandler.command("add_black_list", async (ctx) => {
  try {
    const id = ctx.match;

    await ctx.replyWithChatAction("typing");

    const saved = await prisma.blackList.findUnique({ where: { id } });

    if (saved) {
      return ctx.replyFmt(fmt`Id ${bold(id)} already banned!`);
    }

    await prisma.blackList.create({
      data: {
        id,
        type: "source",
      },
    });

    await initBlackList();

    return ctx.replyFmt(fmt`Id ${bold(id)} banned!`);
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

blackListHandler.command("delete_black_list", async (ctx) => {
  try {
    const id = ctx.match;

    await ctx.replyWithChatAction("typing");

    const saved = await prisma.blackList.findUnique({ where: { id } });

    if (!saved) {
      return ctx.replyFmt(fmt`Id ${bold(id)} not found!`);
    }

    await prisma.blackList.delete({
      where: {
        id,
        type: "source",
      },
    });

    await initBlackList();

    return ctx.replyFmt(fmt`Id ${bold(id)} unbanned!`);
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
