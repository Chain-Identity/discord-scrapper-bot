import {
  APIMessage,
  MessageType as DiscordMessageType,
} from "discord-api-types/v9";
import "@total-typescript/ts-reset/filter-boolean";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";
import { MessageStatus, MessageType } from "src/types/message";

import { getChannelById } from "./get-channel";
import { blackList } from "./black-list";

export const saveMessage = async (message: APIMessage, channelId: string) => {
  try {
    if (
      await prisma.discordSourceMessage.findUnique({
        where: { id: message.id },
      })
    ) {
      return;
    }

    if (!message.author.bot || blackList.has(message.author.id)) {
      return;
    }

    if (message.type === DiscordMessageType.Default) {
      const data = {
        content: message.content,
        attachments:
          message.attachments?.map((attachment) => ({
            url: attachment.url,
            proxy_url: attachment.proxy_url,
            filename: attachment.filename,
          })) || [],
      };

      if (message.attachments.length === 0 && message.content.length < 1) {
        notify(`Parsed empty message ${channelId}`);

        console.log(message);

        await prisma.discordSourceMessage.create({
          data: {
            id: message.id,
            data: JSON.stringify({}),
            type: MessageType.none,
            status: MessageStatus.error,
            discordSourceChannelId: channelId,
            createdAt: new Date(message.timestamp),
          },
        });

        return;
      }

      await prisma.discordSourceMessage.create({
        data: {
          id: message.id,
          data: JSON.stringify(data),
          type: MessageType.common,
          status: MessageStatus.new,
          discordSourceChannelId: channelId,
          createdAt: new Date(message.timestamp),
        },
      });
    } else {
      console.log(message);
      notify(
        `Message type ${DiscordMessageType[message.type]} (${
          message.type
        }) not supported in channel ${channelId} ${
          getChannelById(channelId)?.name
        }`
      );

      await prisma.discordSourceMessage.create({
        data: {
          id: message.id,
          data: JSON.stringify({}),
          type: MessageType.none,
          status: MessageStatus.error,
          discordSourceChannelId: channelId,
          createdAt: new Date(message.timestamp),
        },
      });
    }
  } catch (e) {
    console.error(e);
  }
};
