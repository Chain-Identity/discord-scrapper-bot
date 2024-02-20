import { messageQ } from "src/discord/target";
import { notify } from "src/telegram";
import { SOURCE_FEED_GUILD_ID } from "src/config";
import { APIMessage } from "discord-api-types/v9";

import {
  sourceBotList,
  sourceBotByChannelIdMap,
  sourceBotByGuildIdMap,
  guildByIdMap,
  channelByIdMap,
  feedByNameMap,
  feedByIdMap,
  activeChannelSet,
  activeFeedSet,
} from "./bot";
import { init } from "./init";
import { saveMessage } from "./save-message";
import { saveFeedMessage } from "./save-feed-message";
import { log } from "./log";

export const launchSourceDBot = async () => {
  for (const sourceBot of sourceBotList) {
    const messageProcces = async function (message: APIMessage) {
      if (activeChannelSet.has(message.channel_id)) {
        await saveMessage(message, message.channel_id);

        messageQ.push({
          messageId: message.id,
          sourceChannelId: message.channel_id,
        });

        const channel = channelByIdMap.get(message.channel_id);
        if (channel) {
          notify(`Find new message in ${channel?.name}`);
        }
        log.debug(
          { channel, message, bot: sourceBot.info.user.username },
          `Find new message in ${channel?.name}`
        );
      }

      if (activeFeedSet.has(message.channel_id)) {
        await saveFeedMessage(message, message.channel_id);

        messageQ.push({
          messageId: message.id,
          feedId: message.channel_id,
        });

        const channel = feedByIdMap.get(message.channel_id);
        if (channel) {
          notify(`Find new feed message in ${channel?.name}`);
        }
        log.debug(
          { channel, message, bot: sourceBot.info.user.username },
          `Find new message in feed ${channel?.name}`
        );
      }
    };

    sourceBot.on.message_create = messageProcces;
    sourceBot.on.reply = messageProcces;

    sourceBot.on.ready = function () {
      log.info(`Discord source bot started! ${sourceBot.info.user.username}`);

      sourceBot.info.guilds.forEach((guild) => {
        guildByIdMap.set(guild.id, guild);

        guild.channels.forEach((channel) => {
          channelByIdMap.set(channel.id, channel);
          sourceBotByChannelIdMap.set(channel.id, sourceBot);
        });

        if (guild.id === SOURCE_FEED_GUILD_ID) {
          guild.channels.forEach((channel) => {
            feedByIdMap.set(channel.id, channel);
            feedByNameMap.set(channel.name!, channel);
          });
        }

        sourceBotByGuildIdMap.set(guild.id, sourceBot);
      });
    };
  }

  init();
};

export * from "./get-channel";
export * from "./get-messages";
export * from "./sync-channel";
export * from "./sync-feed-channel";
