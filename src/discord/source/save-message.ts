import {
  APIMessage,
  MessageType as DiscordMessageType,
} from "discord-api-types/v9";
import "@total-typescript/ts-reset/filter-boolean";
import { nanoid } from "nanoid";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";
import { MessageStatus, MessageType } from "src/types/message";

import { getChannelById } from "./get-channel";
import { whiteList } from "./black-list";
import { log } from "./log";

export const saveMessage = async (message: APIMessage, channelId: string) => {
  const traceId = nanoid();

  const trace = log.child({
    traceId,
    channelId,
    message,
  });

  try {
    if (
      await prisma.discordSourceMessage.findUnique({
        where: { id: message.id },
      })
    ) {
      trace.debug("Message already saved");
      return;
    }

    // if (
    //   !message.author.bot ||
    //   blackList.has(message.author.id) ||
    //   blackList.has(message.author.username)
    // ) {
    //   return;
    // }

    if (
      !whiteList.has(message.author.id) &&
      !whiteList.has(message.author.username)
    ) {
      trace.debug("Message from not white listed user");
      return;
    }

    if (
      message.type === DiscordMessageType.Default ||
      message.type === DiscordMessageType.Reply
    ) {
      const data = {
        content: message.content,
        attachments:
          message.attachments?.map((attachment) => ({
            url: attachment.url,
            proxy_url: attachment.proxy_url,
            filename: attachment.filename,
          })) || [],
        replyToId: message.message_reference?.message_id,
      };

      if (message.attachments.length === 0 && message.content.length < 1) {
        // notify(`Parsed empty message ${channelId}`);
        // console.log(message);

        trace.debug("Parsed empty message");

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

      trace.debug("Saving message");

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
      trace.error(
        `Message type ${DiscordMessageType[message.type]} (${
          message.type
        }) not supported in channel ${channelId} ${
          getChannelById(channelId)?.name
        }`
      );
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
    trace.error(e, "Error in saving message");
  }
};
