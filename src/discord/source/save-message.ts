import { APIMessage } from "discord-api-types/v8";
import '@total-typescript/ts-reset/filter-boolean'

import { prisma } from "src/prisma";
import { notify } from "src/telegram";
import { MessageStatus, MessageType, EmbedMessage, FieldType } from "src/types/message";

import { getChannelById } from "./get-channel";

export const saveMessage = async (message: APIMessage, channelId: string) => {
  try {
    if(await prisma.discordSourceMessage.findUnique({where: {id: message.id}})) {
      return
    }

    if (!message.embeds || !message.embeds.length) {
      notify(
        `Embeds not found in message ${message.id} in channel ${channelId} ${getChannelById(channelId)?.name}`
      );
      console.log(message);

      await prisma.discordSourceMessage.create({
        data: {
          id: message.id,
          data: JSON.stringify({}),
          type: MessageType.image,
          status: MessageStatus.error,
          discordSourceChannelId: channelId,
          createdAt: new Date(message.timestamp),
        },
      });

      return;
    }
    const embed = message.embeds[0];

    if (embed.type === "image") {
      await prisma.discordSourceMessage.create({
        data: {
          id: message.id,
          data: JSON.stringify({ image: embed.thumbnail?.proxy_url || embed.thumbnail?.url || embed.url }),
          type: MessageType.image,
          status: MessageStatus.new,
          discordSourceChannelId: channelId,
          createdAt: new Date(embed.timestamp || message.timestamp),
        },
      });
      return;
    }

    const data: EmbedMessage = {
      author: embed.author?.name || "",
      // authorIcon: embed.author?.proxy_icon_url || embed.author?.icon_url || "",
      authorIcon: embed.author?.icon_url || "",
      image: embed.image?.proxy_url || embed.image?.url || null,
      fields: embed.fields?.map((field) => {
        if(field.value.startsWith('`') && field.value.endsWith('`')) {
          const message = field.value.slice(1, -1).trim()
          if(!message) return null

          return {
            content: message,
            type: FieldType.reply,
          }
        }
        let message = field.value

        if(message.startsWith('"')){
          message = message.slice(1)
        }
        if(message.endsWith('"')){
          message = message.slice(0, -1)
        }

        message = message.trim()

        if(!message) return null

        return {
          content: message,
          type: FieldType.message,
        }
      }).filter(Boolean) || [],
    }

    await prisma.discordSourceMessage.create({
      data: {
        id: message.id,
        data: JSON.stringify(data),
        type: MessageType.embed,
        status: MessageStatus.new,
        discordSourceChannelId: channelId,
        createdAt: new Date(embed.timestamp || message.timestamp),
      },
    });

  } catch (e) {
    console.error(e);
  }
};
