import fastq from "fastq";
import { nanoid } from "nanoid";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";

import { getBot } from "./bot";
import { MessageType, CommonMessage, MessageStatus } from "src/types/message";

import { log } from "./log";

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
  const traceId = nanoid();

  const traceTask = log.child({
    traceId,
    task,
  });

  traceTask.info("Start processing message");

  try {
    const targetChannel = await getTargetChannel(task);

    if (!targetChannel) {
      traceTask.error("Target channel not found");
      return;
    }

    const targetBot = getBot(targetChannel.DiscordTargetBot?.name);

    if (!targetBot) {
      traceTask.error("Target bot not found");
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

    const trace = traceTask.child({
      channel,
      message,
    });

    if (!channel || !channel.isTextBased() || !message) {
      if (!channel) {
        trace.error("Channel not found");
      }
      if (!channel?.isTextBased()) {
        trace.error("Channel is not text based");
      }

      if (!message) {
        trace.error("Message not found");
      }

      return;
    }

    if (message.status === MessageStatus.sent) {
      trace.debug("Message already sent");
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

      if (content.length < 1 && data.attachments.length === 0) {
        // notify(`Empty message in ${targetChannel.name} (${targetChannel.id})`);
        // console.log(message);
        trace.debug({ content }, "Empty message");

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
              id: data.replyToId,
            },
          })
        : null;

      const messageReplyTarget =
        messageReplySource && messageReplySource.messageId
          ? await prisma.message.findUnique({
              where: {
                id: messageReplySource.messageId,
              },
            })
          : null;

      let messageId: string;

      if (content.length > 2000) {
        trace.debug("Message too long");
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

        trace.debug(
          {
            content,
            fields,
            data,
            messageReplySource,
            messageReplyTarget,
            sendedMessage,
          },
          "Long message sent"
        );
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

        trace.debug(
          {
            content,
            data,
            messageReplySource,
            messageReplyTarget,
            sendedMessage,
          },
          "Message sent"
        );
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
          messageId: messageId,
        },
      });

      return;
    }
  } catch (e) {
    const targetChannel = await getTargetChannel(task).catch(() => null);
    traceTask.error(e, "Error in sending message " + targetChannel?.name || "");
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
