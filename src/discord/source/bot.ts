import Discord from "discord-user-bots";

import { SOURCE_ACCOUNT_TOKEN_LIST } from "src/config";

export const sourceBotList = SOURCE_ACCOUNT_TOKEN_LIST.map(
  (token) => new Discord.Client(token)
);

export const sourceBotByGuildIdMap = new Map<string, Discord.Client>();
export const sourceBotByChannelIdMap = new Map<string, Discord.Client>();

export const guildByIdMap = new Map<string, Discord.Guild>();

export const channelByIdMap = new Map<string, Discord.Channel>();
export const channelByNameMap = new Map<string, Discord.Channel>();
export const feedByIdMap = new Map<string, Discord.Channel>();
export const feedByNameMap = new Map<string, Discord.Channel>();

export const activeChannelSet = new Set<string>();
export const activeFeedSet = new Set<string>();
