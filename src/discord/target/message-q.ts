import fastq from "fastq";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";

import { targetDBot } from "./bot";
import {
  MessageType,
  ImageMessage,
  EmbedMessage,
  EmbedWithUrlMessage,
  FieldType,
  MessageStatus,
} from "src/types/message";

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

    if(!connector?.discordTargetChannelId){
      return null
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

  if(!sourceChannel?.discordTargetChannelId){
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

    if (message.type === MessageType.image) {
      const data: ImageMessage = JSON.parse(message.data);

      const sendedMessage = await channel.send({
        embeds: [
          {
            image: {
              url: data.image,
            },
            description: "",
            color: COLOR,
            timestamp: message.createdAt.toISOString(),
          },
        ],
      });

      await prisma.message.create({
        data: {
          id: sendedMessage.id,
          data: message.data,
          type: MessageType.image,
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

    if (message.type === MessageType.embed) {
      const data: EmbedMessage = JSON.parse(message.data);

      const sendedMessage = await channel.send({
        embeds: [
          {
            author: {
              name: data.author,
              icon_url: data.authorIcon,
            },
            fields: data.fields.map((field) => ({
              name: "",
              value:
                field.type === FieldType.reply
                  ? "`" + field.content + "`"
                  : field.content,
            })),
            image: data.image
              ? {
                  url: data.image,
                }
              : undefined,
            color: COLOR,
            timestamp: message.createdAt.toISOString(),
          },
        ],
      });

      await prisma.message.create({
        data: {
          id: sendedMessage.id,
          data: message.data,
          type: MessageType.embed,
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

    if (message.type === MessageType.embedWithUrl) {
      const data: EmbedWithUrlMessage = JSON.parse(message.data);

      const sendedMessage = await channel.send({
        embeds: [
          {
            title: data.title,
            url: data.url,
            description: data.description,
            thumbnail: data.thumbnail ? {
              url: data.thumbnail,
            } : undefined,
            fields: data.fields,
            color: COLOR,
          },
        ],
      });

      await prisma.message.create({
        data: {
          id: sendedMessage.id,
          data: message.data,
          type: MessageType.embedWithUrl,
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
