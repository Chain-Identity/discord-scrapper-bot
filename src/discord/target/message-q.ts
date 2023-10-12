import fastq from "fastq";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";

import { targetDBot } from "./bot";
import { MessageType, ImageMessage, EmbedMessage, FieldType, MessageStatus } from "src/types/message";

type Task = {
  messageId: string;
} & (
  | {
      sourceChannelId: string;
    }
  | {
      targetChannelId: string;
    }
);

const COLOR = 0xAD1456

export const messageQ = fastq.promise<void, Task, void>(async (task) => {
  try {
    const sourceChannel = await prisma.discordSourceChannel.findUnique({
      where:
        "sourceChannelId" in task
          ? {
              id: task.sourceChannelId,
            }
          : {
              discordTargetChannelId: task.targetChannelId,
            },
    });
    if (!sourceChannel) {
      return;
    }
    const [channel, message] = await Promise.all([
      targetDBot.channels.fetch(sourceChannel.discordTargetChannelId),
      prisma.discordSourceMessage.findUnique({
        where: {
          id: task.messageId,
        },
      }),
    ]);

    if (!channel || !channel.isTextBased() || !message) {
      return;
    }

    if(message.status === MessageStatus.sent){
      return
    }


    if(message.type === MessageType.image){
      const data: ImageMessage = JSON.parse(message.data)

      const sendedMessage = await channel.send({
        embeds: [
          {
            image: {
              url: data.image,
            },
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

    if(message.type === MessageType.embed){
      const data: EmbedMessage = JSON.parse(message.data)

      const sendedMessage = await channel.send({
        embeds: [
          {
            author: {
              name: data.author,
              icon_url: data.authorIcon,
            },
            fields: data.fields.map(field => ({
              name: '',
              value: field.type === FieldType.reply ? ('`' + field.content + '`') : field.content,
            })),
            image: data.image ? {
              url: data.image,
            } : undefined,
            color: COLOR,
            timestamp: message.createdAt.toISOString(),
          }
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

  } catch (e) {
    console.error(e);
    notify('Error in sending message')
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
