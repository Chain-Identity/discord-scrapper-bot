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

    await syncChannel({
      channelId: channel.id,
      lastSavedMessageId: lastMessage?.id || undefined,
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};

interface IProps {
  channelId: string;
  lastSavedMessageId?: string;
  short?: boolean;
  lastNDays?: number;
}

export const syncChannel = async ({
  channelId,
  lastSavedMessageId,
  short,
  lastNDays,
}: IProps) => {
  const messages = await getMessages({
    channelId,
    lastSavedMessageId,
    short,
    lastNDays,
  });

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

    if (channel?.discordTargetChannelId) {
      await syncTargetChannel(channel.discordTargetChannelId);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};
