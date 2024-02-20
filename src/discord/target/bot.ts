import { Client, GatewayIntentBits } from "discord.js";
import { prisma } from "src/prisma";
import { notify } from "src/telegram";

import { log } from "./log";

const botMap = new Map<string, Client>();

export const initBot = async (name: string) => {
  const botDb = await prisma.discordTargetBot.findFirst({ where: { name } });
  try {
    if (!botDb) {
      log.error(`bot ${name} not found`);
      return;
    }

    if (botMap.has(name)) {
      log.debug(`bot ${name} already started`);
      return;
    }

    const targetBot = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
      ],
    });

    await targetBot.login(botDb.token);

    await new Promise((resolve) => setTimeout(resolve, 100));

    botMap.set(name, targetBot);
  } catch (error) {
    log.error(error, `Error in starting target bot ${name} ${botDb?.token}`);

    notify(`Error in starting target bot ${name} ${botDb?.token}`);
  }
};

export const getBot = (name: string) => {
  return botMap.get(name);
};
