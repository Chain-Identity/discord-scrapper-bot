import { prisma } from "src/prisma";

import { initBot } from "./bot";
import { init } from "./init";

export const launchTargetDBot = async () => {
  try {
    console.log("launch target bots");

    const botList = await prisma.discordTargetBot.findMany();

    for (const bot of botList) {
      await initBot(bot.name);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Discord Target bots started!");

    init();
  } catch (e) {
    console.error(e);
  }
};

export * from "./add-channel";
export * from "./sync-channel";
export * from "./sync-from-feed";
export * from "./message-q";
