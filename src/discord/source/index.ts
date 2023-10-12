import { messageQ } from "src/discord/target";
import { notify } from "src/telegram";
import { SOURCE_GUILD_NAME } from 'src/config'

import {
  sourceDBot,
  guildByIdMap,
  channelByIdMap,
  channelByNameMap,
  activeChannelSet,
} from "./bot";
import { init } from "./init";
import { saveMessage } from './save-message'

export const launchSourceDBot = async () => {
  sourceDBot.on.ready = function () {
    console.log("Discord source bot started!");

    sourceDBot.info.guilds.forEach((guild) => {
      guildByIdMap.set(guild.id, guild);

      if(guild.name !== SOURCE_GUILD_NAME){
        return
      }
      guild.channels.forEach((channel) => {
        channelByIdMap.set(channel.id, channel);
        channelByNameMap.set(channel.name!, channel);
      });
    });

    init();
  };

  sourceDBot.on.message_create = async function (message) {
    if (!activeChannelSet.has(message.channel_id)) {
      return;
    }

    await saveMessage(message, message.channel_id);

    messageQ.push({
      messageId: message.id,
      sourceChannelId: message.channel_id,
    });

    const channel = channelByIdMap.get(message.channel_id);
    if (channel) {
      notify(`Find new message in ${channel?.name}`);
    }
  };
};

export * from "./get-channel";
export * from "./get-messages";
export * from "./sync-channel";
