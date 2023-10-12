import Discord from "discord-user-bots";

import { SOURCE_ACCOUNT_TOKEN } from "src/config";

export const sourceDBot = new Discord.Client(SOURCE_ACCOUNT_TOKEN);

export const guildByIdMap = new Map<string, Discord.Guild>();

export const channelByIdMap = new Map<string, Discord.Channel>();
export const channelByNameMap = new Map<string, Discord.Channel>();

export const activeChannelSet = new Set<string>();
