import { Composer } from "grammy";

import { getChannelByName, syncChannel } from "src/discord/source";
import { activeChannelSet } from "src/discord/source/bot";
import { prisma } from "src/prisma";
import { addChannel } from "src/discord/target";

import { BotContext } from "./types";

export const recreateChannelHandler = new Composer<BotContext>();

// recreateChannelHandler.command("recreate_channel", async (ctx) => {
//   try {
//     const channelName = ctx.match;

//     await ctx.replyWithChatAction("typing");

//     const channel = getChannelByName(channelName);

//     if (!channel) {
//       return ctx.reply("Channel not found!");
//     }

//     activeChannelSet.delete(channel.id);

//     const savedSourceChannel = await prisma.discordSourceChannel.findUnique({
//       where: {
//         id: channel.id,
//       },
//     });

//     if (!savedSourceChannel) {
//       return ctx.reply("Channel not found!");
//     }

//     const savedTargetChannel = await prisma.discordTargetChannel.findUnique({
//       where: {
//         id: savedSourceChannel.discordTargetChannelId,
//       },
//     });

//     if (!savedTargetChannel) {
//       return ctx.reply("Channel not found!");
//     }

//     const messages = await prisma.message.findMany({
//       where: {
//         discordTargetChannelId: savedTargetChannel.id,
//       }
//     });

//     await prisma.message.deleteMany({
//       where: {
//         id: {
//           in: messages.map(message => message.id),
//         },
//       },
//     });

//     const sourceMessages = await prisma.discordSourceMessage.findMany({
//       where: {
//         discordSourceChannelId: savedSourceChannel.id,
//       },
//     });

//     await prisma.discordSourceMessage.deleteMany({
//       where: {
//         id: {
//           in: sourceMessages.map(message => message.id),
//         },
//       },
//     });

//     await prisma.discordSourceChannel.delete({
//       where: {
//         id: savedSourceChannel.id,
//       },
//     });

//     await prisma.discordTargetChannel.delete({
//       where: {
//         id: savedSourceChannel.discordTargetChannelId,
//       },
//     });

//     const targetName = `${channel.name!}`;

//     const newChannel = await addChannel({
//       name: targetName,
//     });

//     await prisma.discordSourceChannel.create({
//       data: {
//         id: channel.id,
//         name: channel.name!,
//         discordTargetChannelId: newChannel.id,
//       },
//     });

//     await syncChannel(channel.id);

//     return ctx.reply("Channel recreated!");

//   } catch (e) {
//     console.error(e);
//     ctx.reply("Что-то сломалось(");
//     return typeof e === "object" &&
//       e &&
//       "message" in e &&
//       typeof e.message === "string" &&
//       ctx.reply(e.message);
//   }
// });
