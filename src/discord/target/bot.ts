import { Client, GatewayIntentBits } from "discord.js";
import { prisma } from "src/prisma";

const botMap = new Map<string, Client>();

export const initBot = async (name: string) => {
  const botDb = await prisma.discordTargetBot.findFirst({ where: { name } });

  if (!botDb) {
    console.log(`bot ${botDb} not found`);
    return;
  }

  if (botMap.has(name)) {
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
};

export const getBot = (name: string) => {
  return botMap.get(name);
};
