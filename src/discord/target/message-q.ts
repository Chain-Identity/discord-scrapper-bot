import fastq from "fastq";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";

import { getBot } from "./bot";
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
      include: {
        DiscordTargetBot: true,
      },
    });
  }

  if ("targetChannelId" in task) {
    return prisma.discordTargetChannel.findUnique({
      where: {
        id: task.targetChannelId,
      },
      include: {
        DiscordTargetBot: true,
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
    include: {
      DiscordTargetBot: true,
    },
  });
};

type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export const messageQ = fastq.promise<void, Task, void>(async (task) => {
  try {
    const targetChannel = await getTargetChannel(task);

    if (!targetChannel) {
      return;
    }

    const targetBot = getBot(targetChannel.DiscordTargetBot?.name);

    if (!targetBot) {
      return;
    }

    const [channel, message]: [
      UnPromisify<ReturnType<typeof targetBot.channels.fetch>>,
      UnPromisify<ReturnType<typeof prisma.discordSourceMessage.findUnique>>
    ] = await Promise.all([
      targetBot.channels.fetch(targetChannel.id),
      prisma.discordSourceMessage.findUnique({
        where: {
          id: task.messageId,
        },
      }),
    ] as const);

    if (!channel || !channel.isTextBased() || !message) {
      return;
    }

    if (message.status === MessageStatus.sent) {
      return;
    }

    if (message.type === MessageType.common) {
      const data: CommonMessage = JSON.parse(message.data);

      let content = data.content
        //discord links
        .replace(/(?:__|[*#])|\[(.*?)\]\(.*discord\.com.*?\)/gm, "$1")
        //discord spoiler
        .replace(/(\|\|.*\|\|)/gm, "")
        //discord mentions
        .replace(/<@&(\d+)>/gm, "")
        .replace("@everyone", "")
        .replace("@here", "")
        .trim();

      if (content.length < 5 && data.attachments.length === 0) {
        notify(`Empty message in ${targetChannel.name} (${targetChannel.id})`);
        console.log(message);
        await prisma.discordSourceMessage.update({
          where: {
            id: task.messageId,
          },
          data: {
            status: MessageStatus.error,
          },
        });

        return;
      }

      const messageReplySource = data.replyToId
        ? await prisma.discordSourceMessage.findFirst({
            where: {
              messageId: data.replyToId,
            },
          })
        : null;

      const messageReplyTarget = messageReplySource
        ? await prisma.message.findFirst({
            where: {
              discordSourceMessage: messageReplySource,
            },
          })
        : null;

      let messageId: string;

      if (content.length > 2000) {
        const fields = content
          .split("\n\n")
          .map((x) => x.trim())
          .filter(Boolean)
          .flatMap((value) =>
            value.length > 1024
              ? value
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean)
                  .map((x) => ({
                    name: "",
                    value: x,
                  }))
              : {
                  name: "",
                  value: value,
                }
          );

        const sendedMessage = await channel.send({
          embeds: [
            {
              fields,
              image: data.attachments.length
                ? {
                    url: data.attachments[0].proxy_url,
                  }
                : undefined,
            },
          ],

          reply: messageReplyTarget
            ? {
                messageReference: messageReplyTarget.id,
                failIfNotExists: false,
              }
            : undefined,
        });

        messageId = sendedMessage.id;
      } else {
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

          reply: messageReplyTarget
            ? {
                messageReference: messageReplyTarget.id,
                failIfNotExists: false,
              }
            : undefined,
        });

        messageId = sendedMessage.id;
      }

      await prisma.message.create({
        data: {
          id: messageId,
          data: message.data,
          type: MessageType.common,
          discordTargetChannelId: channel.id,
          createdAt: new Date(),
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
