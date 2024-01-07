import { TARGET_GUILD_ID, TARGET_GROUP_ID } from "src/config";
import { prisma } from "src/prisma";

import { getBot } from "./bot";
import { ChannelType } from "discord.js";

interface AddChannelProps {
  name: string;
  targetBotName: string;
}

export const addChannel = async (props: AddChannelProps) => {
  const targetBot = getBot(props.targetBotName);

  if (!targetBot) {
    return;
  }

  const guild = await targetBot.guilds.fetch(TARGET_GUILD_ID);

  const channel = await guild.channels.create({
    name: props.name,
    type: ChannelType.GuildText,
    parent: TARGET_GROUP_ID,
  });

  const dbTargetBot = await prisma.discordTargetBot.findFirst({
    where: {
      name: props.targetBotName,
    },
  });

  if (!dbTargetBot) {
    return;
  }

  return await prisma.discordTargetChannel.create({
    data: {
      id: channel.id,
      name: props.name,
      discordTargetBotId: dbTargetBot.id,
    },
  });
};
