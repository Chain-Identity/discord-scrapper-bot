import { env } from "node:process";

import dotenv from "dotenv";

dotenv.config();

export const TG_TOKEN = env.TG_TOKEN!;
export const TG_CHAT_ID = env.TG_CHAT_ID!;

export const SOURCE_ACCOUNT_TOKEN = env.SOURCE_ACCOUNT_TOKEN!;
export const SOURCE_GUILD_NAME = env.SOURCE_GUILD_NAME!;
export const SOURCE_FEED_GUILD_NAME = env.SOURCE_FEED_GUILD_NAME!;

export const TARGET_BOT_TOKEN = env.TARGET_BOT_TOKEN!;
export const TARGET_GUILD_ID = env.TARGET_GUILD_ID!;
export const TARGET_GROUP_ID = env.TARGET_GROUP_ID!;
export const TARGET_SUMMARY_CHANNEL = env.TARGET_SUMMARY_CHANNEL!;

export const OPENAI_TOKEN = env.OPENAI_TOKEN!;
