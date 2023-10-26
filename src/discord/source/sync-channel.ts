import { prisma } from "src/prisma";

import { notify } from "src/telegram";
import { syncTargetChannel } from "src/discord/target";

import { getMessages } from "./get-messages";
import { activeChannelSet } from "./bot";
import { saveMessage } from "./save-message";

export const syncAllChannels = async () => {
  const channels = await prisma.discordSourceChannel.findMany();

  for (const channel of channels) {
    const lastMessage = await prisma.discordSourceMessage.findFirst({
      where: {
        discordSourceChannelId: channel.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    await syncChannel(channel.id, lastMessage?.id || undefined);

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};

export const syncChannel = async (
  channelId: string,
  lastSavedMessageId?: string
) => {
  const messages = await getMessages({ channelId, lastSavedMessageId });

  for (const message of messages) {
    await saveMessage(message, channelId);
  }

  const channel = await prisma.discordSourceChannel.findUnique({
    where: {
      id: channelId,
    },
  });

  activeChannelSet.add(channelId);

  if (messages.length) {
    notify(
      `Syncing ${messages.length} messages from source channel ${
        channel ? channel.name : channelId
      }`
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    if(channel?.discordTargetChannelId){
      await syncTargetChannel(channel.discordTargetChannelId);
    }


    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};
