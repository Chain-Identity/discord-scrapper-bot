import { Bot, GrammyError, HttpError } from "grammy";
import { hydrateReply } from "@grammyjs/parse-mode";

import { TG_TOKEN, TG_CHAT_ID } from "src/config";

import type { BotContext } from "./types";

import { addChannelHandler } from "./add-channel";
import { deleteChannelHandler } from "./delete-channel";
import { recreateChannelHandler } from './recreate-channel'
import { statusHandler } from './status'
import { lastMessagesHandler } from './last-messages'
import { aiHandler } from './ai'

export const tgBot = new Bot<BotContext>(TG_TOKEN);

tgBot.use(hydrateReply);


const chatId = Number.parseInt(TG_CHAT_ID);

tgBot.filter((x) => x.chat?.id === chatId).use(addChannelHandler);
tgBot.filter((x) => x.chat?.id === chatId).use(deleteChannelHandler);
tgBot.filter((x) => x.chat?.id === chatId).use(recreateChannelHandler);
tgBot.filter((x) => x.chat?.id === chatId).use(statusHandler);
tgBot.filter((x) => x.chat?.id === chatId).use(lastMessagesHandler);
tgBot.filter((x) => x.chat?.id === chatId).use(aiHandler)

tgBot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
