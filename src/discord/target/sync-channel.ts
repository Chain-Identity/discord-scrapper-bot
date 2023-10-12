import { prisma } from "src/prisma";

import { messageQ } from "./message-q";
import { MessageStatus } from "src/types/message";

export const syncAllChannels = async () => {
  const channels = await prisma.discordSourceChannel.findMany();

  for (const channel of channels) {
    await syncTargetChannel(channel.id);
  }
};

export const syncTargetChannel = async (sourceChannelId: string) => {
  const messages = await prisma.discordSourceMessage.findMany({
    where: {
      discordSourceChannelId: sourceChannelId,
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
      sourceChannelId,
    });
  }
};
