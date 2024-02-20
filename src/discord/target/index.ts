import { prisma } from "src/prisma";

import { initBot } from "./bot";
import { init } from "./init";
import { log } from "./log";

export const launchTargetDBot = async () => {
  try {
    log.info("launch target bots");

    const botList = await prisma.discordTargetBot.findMany();

    for (const bot of botList) {
      await initBot(bot.name);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    log.info("Discord Target bots started!");

    init();
  } catch (e) {
    console.error(e);
  }
};

export * from "./add-channel";
export * from "./sync-channel";
export * from "./sync-from-feed";
export * from "./message-q";
