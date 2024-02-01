import { messageQ } from "src/discord/target";
import { notify } from "src/telegram";
import { SOURCE_GUILD_ID_LIST, SOURCE_FEED_GUILD_ID } from "src/config";

import {
  sourceBotList,
  sourceBotByChannelIdMap,
  sourceBotByGuildIdMap,
  guildByIdMap,
  channelByIdMap,
  channelByNameMap,
  feedByNameMap,
  feedByIdMap,
  activeChannelSet,
  activeFeedSet,
} from "./bot";
import { init } from "./init";
import { saveMessage } from "./save-message";
import { saveFeedMessage } from "./save-feed-message";

export const launchSourceDBot = async () => {
  for (const sourceBot of sourceBotList) {
    sourceBot.on.message_create = async function (message) {
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
      }
    };
    sourceBot.on.ready = function () {
      console.log(
        `Discord source bot started! ${sourceBot.info.user.username}`
      );

      sourceBot.info.guilds.forEach((guild) => {
        guildByIdMap.set(guild.id, guild);

        if (SOURCE_GUILD_ID_LIST.includes(guild.id)) {
          guild.channels.forEach((channel) => {
            channelByIdMap.set(channel.id, channel);
            channelByNameMap.set(channel.name!, channel);
            sourceBotByChannelIdMap.set(channel.id, sourceBot);
          });
        }

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
