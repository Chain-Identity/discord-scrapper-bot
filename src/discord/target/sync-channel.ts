import { prisma } from "src/prisma";

import { messageQ } from "./message-q";
import { MessageStatus } from "src/types/message";

export const syncAllChannels = async () => {
  const channels = await prisma.discordTargetChannel.findMany();

  for (const channel of channels) {
    await syncTargetChannel(channel.id);
  }
};

export const syncTargetChannel = async (targetChannelId: string) => {
  const sourceChannel = await prisma.discordSourceChannel.findFirst({
    where: {
      discordTargetChannelId: targetChannelId,
    },
  });
  if(!sourceChannel){
    return
  }
  const messages = await prisma.discordSourceMessage.findMany({
    where: {
      discordSourceChannelId: sourceChannel.id,
      messageId: null,
      status: MessageStatus.new,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  for (const message of messages) {
    messageQ.push({
      messageId: message.id,
      targetChannelId,
    });
  }
};
