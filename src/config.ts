import { env } from "node:process";

import dotenv from "dotenv";

dotenv.config();

export const TG_TOKEN = env.TG_TOKEN!;
export const TG_CHAT_ID = env.TG_CHAT_ID!;

export const SOURCE_ACCOUNT_TOKEN_LIST = env.SOURCE_ACCOUNT_TOKEN!.split("|");
export const SOURCE_GUILD_ID_LIST = env.SOURCE_GUILD_ID!.split("|");
export const SOURCE_FEED_GUILD_ID = env.SOURCE_FEED_GUILD_ID!;

export const TARGET_GUILD_ID = env.TARGET_GUILD_ID!;
export const TARGET_GROUP_ID = env.TARGET_GROUP_ID!;

export const OPENAI_TOKEN = env.OPENAI_TOKEN!;
