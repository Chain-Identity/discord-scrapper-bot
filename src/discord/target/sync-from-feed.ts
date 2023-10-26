import { prisma } from "src/prisma";

import { messageQ } from "./message-q";
import { MessageStatus } from "src/types/message";

export const syncAllChannelsFromFeed = async () => {
  const channels = await prisma.discordFeedConnector.findMany();

  for (const channel of channels) {
    await syncTargetChannelFromFeed(channel.id);
  }
};

export const syncTargetChannelFromFeed = async (connectorId: number) => {
  const connector = await prisma.discordFeedConnector.findUnique({
    where: {
      id: connectorId,
    },
  });

  if (!connector) {
    return;
  }

  const [sourceFeedChannel, targetChannel] = await Promise.all([
    prisma.discordSourceFeedChannel.findFirst({
      where: {
        id: connector.discordSourceFeedChannelId,
      },
    }),
    prisma.discordTargetChannel.findFirst({
      where: {
        id: connector.discordTargetChannelId,
      },
    }),
  ]);

  if (!sourceFeedChannel || !targetChannel) {
    return;
  }

  const messages = await prisma.discordSourceMessage.findMany({
    where: {
      discordSourceFeedChannelId: sourceFeedChannel.id,
      name: connector.name,
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
      feedId: sourceFeedChannel.id,
    });
  }
};
