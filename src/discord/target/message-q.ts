import fastq from "fastq";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";

import { targetDBot } from "./bot";
import {
  MessageType,
  ImageMessage,
  CommonMessage,
  EmbedWithUrlMessage,
  FieldType,
  MessageStatus,
} from "src/types/message";
import { Attachment } from "discord.js";

type Task = {
  messageId: string;
} & (
  | {
      sourceChannelId: string;
    }
  | {
      targetChannelId: string;
    }
  | {
      feedId: string;
    }
);

const COLOR = 0xad1456;

const getTargetChannel = async (task: Task) => {
  if ("feedId" in task) {
    const message = await prisma.discordSourceMessage.findUnique({
      where: {
        id: task.messageId,
      },
    });

    const connector = await prisma.discordFeedConnector.findFirst({
      where: {
        name: message?.name!,
        discordSourceFeedChannelId: task.feedId,
      },
    });

    if (!connector?.discordTargetChannelId) {
      return null;
    }

    return prisma.discordTargetChannel.findUnique({
      where: {
        id: connector?.discordTargetChannelId!,
      },
    });
  }

  if ("targetChannelId" in task) {
    return prisma.discordTargetChannel.findUnique({
      where: {
        id: task.targetChannelId,
      },
    });
  }

  const sourceChannel = await prisma.discordSourceChannel.findUnique({
    where: {
      id: task.sourceChannelId,
    },
  });

  if (!sourceChannel?.discordTargetChannelId) {
    return null;
  }

  return prisma.discordTargetChannel.findUnique({
    where: {
      id: sourceChannel?.discordTargetChannelId!,
    },
  });
};

export const messageQ = fastq.promise<void, Task, void>(async (task) => {
  try {
    const targetChannel = await getTargetChannel(task);

    if (!targetChannel) {
      return;
    }

    const [channel, message] = await Promise.all([
      targetDBot.channels.fetch(targetChannel.id),
      prisma.discordSourceMessage.findUnique({
        where: {
          id: task.messageId,
        },
      }),
    ]);

    if (!channel || !channel.isTextBased() || !message) {
      return;
    }

    if (message.status === MessageStatus.sent) {
      return;
    }

    if (message.type === MessageType.common) {
      const data: CommonMessage = JSON.parse(message.data);

      let content = data.content.replace(
        /(?:__|[*#])|\[(.*?)\]\(.*?\)/gm,
        "$1"
      );

      const sendedMessage = await channel.send({
        content,
        embeds: data.attachments.length
          ? data.attachments.map((attachment) => ({
              image: {
                url: attachment.proxy_url,
              },
              description: "",
            }))
          : undefined,
      });

      await prisma.message.create({
        data: {
          id: sendedMessage.id,
          data: message.data,
          type: MessageType.common,
          discordTargetChannelId: channel.id,
          createdAt: new Date(sendedMessage.createdTimestamp),
        },
      });

      await prisma.discordSourceMessage.update({
        where: {
          id: message.id,
        },
        data: {
          status: MessageStatus.sent,
        },
      });

      return;
    }
  } catch (e) {
    console.error(e);
    const targetChannel = await getTargetChannel(task).catch(() => null);
    notify("Error in sending message " + targetChannel?.name || "");
    await prisma.discordSourceMessage.update({
      where: {
        id: task.messageId,
      },
      data: {
        status: MessageStatus.error,
      },
    });
  }
}, 1);
