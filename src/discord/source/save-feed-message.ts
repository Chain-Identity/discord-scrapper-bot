import { APIMessage } from "discord-api-types/v8";
import "@total-typescript/ts-reset/filter-boolean";

import { prisma } from "src/prisma";
import { notify } from "src/telegram";
import {
  MessageStatus,
  MessageType,
  EmbedMessage,
  FieldType,
} from "src/types/message";

import { getChannelById } from "./get-channel";

export const saveFeedMessage = async (message: APIMessage, feedId: string) => {
  try {
    if (
      await prisma.discordSourceMessage.findUnique({
        where: { id: message.id },
      })
    ) {
      return;
    }

    if (!message.embeds || !message.embeds.length) {
      notify(
        `Embeds not found in message ${message.id} in channel ${feedId} ${
          getChannelById(feedId)?.name
        }`
      );
      console.log(message);

      await prisma.discordSourceMessage.create({
        data: {
          id: message.id,
          data: JSON.stringify({}),
          type: MessageType.none,
          status: MessageStatus.error,
          discordSourceFeedChannelId: feedId,
          createdAt: new Date(message.timestamp),
        },
      });

      return;
    }
    const embed = message.embeds[0];

    const data: EmbedMessage = {
      author: embed.author?.name || "",
      authorIcon: embed.author?.icon_url || "",
      image: embed.image?.proxy_url || embed.image?.url || null,
      fields: [
        ...(embed.fields
          ? embed.fields.map((field) => ({
              content:
                `Replying to "${field.name.split(": ")[1].slice(0, -1)}": "` +
                field.value +
                `"`,
              type: FieldType.reply,
            }))
          : []),
        ...(embed.description
          ? embed.description.split("\n").flatMap((content) => ({
              content: content,
              type: FieldType.message,
            }))
          : []),
      ].filter(Boolean),
    };

    await prisma.discordSourceMessage.create({
      data: {
        id: message.id,
        name: data.author,
        data: JSON.stringify(data),
        type: MessageType.embed,
        status: MessageStatus.new,
        discordSourceFeedChannelId: feedId,
        createdAt: new Date(embed.timestamp || message.timestamp),
      },
    });
  } catch (e) {
    console.error(e);
  }
};
