import { prisma } from "src/prisma";

import { notify } from "src/telegram";
import { syncTargetChannelFromFeed } from "src/discord/target";

import { getMessages } from "./get-messages";
import { activeFeedSet } from "./bot";
import { saveFeedMessage } from "./save-feed-message";

export const syncAllFeedChannels = async () => {
  const feeds = await prisma.discordSourceFeedChannel.findMany();

  for (const feed of feeds) {
    const lastMessage = await prisma.discordSourceMessage.findFirst({
      where: {
        discordSourceFeedChannelId: feed.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    await syncFeedChannel(feed.id, lastMessage?.id || undefined);

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};

export const syncFeedChannel = async (
  feedId: string,
  lastSavedMessageId?: string
) => {
  const messages = await getMessages({ channelId: feedId, lastSavedMessageId });

  for (const message of messages) {
    await saveFeedMessage(message, feedId);
  }

  const channel = await prisma.discordSourceFeedChannel.findUnique({
    where: {
      id: feedId,
    },
  });

  activeFeedSet.add(feedId);

  if (messages.length) {
    notify(
      `Syncing ${messages.length} messages from source feed channel ${
        channel ? channel.name : feedId
      }`
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    const connectorList = await prisma.discordFeedConnector.findMany({
      where: {
        discordSourceFeedChannelId: feedId,
      },
    });

    for (const connector of connectorList) {
      await syncTargetChannelFromFeed(connector.id);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};
