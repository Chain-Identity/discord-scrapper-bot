import OpenAI from "openai";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { channelMention } from "discord.js";

import { OPENAI_TOKEN } from "src/config";
import { prisma } from "src/prisma";
import { notify } from "src/telegram/notify";

import { targetDBot } from "./bot";
import { EmbedMessage, MessageType } from "src/types/message";

const openai = new OpenAI({
  apiKey: OPENAI_TOKEN,
});

export const sendAllSummaries = async (now = new Date()) => {
  const channels = await prisma.discordTargetChannel.findMany({
    where: {
      summaryChannelId: {
        not: null,
      },
    },
  });

  for (const channel of channels) {
    await sendSummary(channel.id, now);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export const sendSummary = async (channelId: string, now: Date) => {
  const targetChannel = await prisma.discordTargetChannel.findUnique({
    where: {
      id: channelId,
    },
  });

  if (!targetChannel || !targetChannel.summaryChannelId) {
    return;
  }

  const previousDay = subDays(now, 1);

  const messages = await prisma.message.findMany({
    where: {
      discordTargetChannelId: channelId,
      type: MessageType.embed,
      createdAt: {
        gte: startOfDay(previousDay),
        lte: endOfDay(previousDay),
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (messages.length < 10) {
    console.log("Not enough messages in " + targetChannel.name, true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  const prompt = messages
    .map((message) => {
      const data: EmbedMessage = JSON.parse(message.data);
      const quote = data.fields
        .filter((field) => field.type === "reply")
        .map((x) => x.content)
        .join("\n");

      const msg = data.fields
        .filter((field) => field.type === "message")
        .map((x) => x.content)
        .join("\n");

      if (!msg) return null;

      return `${data.author}: ${msg} ${quote || ""}`;
    })
    .join("\n\n");

  try {
    const targetBotChannel = await targetDBot.channels.fetch(
      targetChannel.summaryChannelId
    );

    if (!targetBotChannel || !targetBotChannel.isTextBased()) {
      notify("Target channel is not text based");
      return;
    }

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "For the chat history make a summary with 3-5 key points:\n\n" +
            prompt,
        },
      ],
    });

    const message = gptResponse.choices[0].message.content;

    if (!message) {
      notify("Bad response from GPT-3");
      return;
    }

    await targetBotChannel.send({
      embeds: [
        {
          description:
            `${channelMention(
              targetChannel.id
            )} summary for ${format(previousDay, "MM/dd/yyyy")}\n\n` + message,
          color: 0xad1456,
        },
      ],
    });

    notify(
      `${targetChannel.name} summary for ${format(
        previousDay,
        "MM/dd/yyyy"
      )}\n\n` + message
    );
  } catch (e) {
    console.log("Error in sending summary " + targetChannel.summaryChannelId)
    console.error(e);
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
};
