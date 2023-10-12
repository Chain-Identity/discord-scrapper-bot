import { TARGET_GUILD_ID, TARGET_GROUP_ID } from "src/config";
import { prisma } from "src/prisma";

import { targetDBot } from "./bot";
import { ChannelType } from "discord.js";

interface AddChannelProps {
  name: string;
}

export const addChannel = async (props: AddChannelProps) => {
  const guild = await targetDBot.guilds.fetch(TARGET_GUILD_ID);

  const channel = await guild.channels.create({
    name: props.name,
    type: ChannelType.GuildText,
    parent: TARGET_GROUP_ID,
  });

  return await prisma.discordTargetChannel.create({
    data: {
      id: channel.id,
      name: props.name,
    },
  });
};
