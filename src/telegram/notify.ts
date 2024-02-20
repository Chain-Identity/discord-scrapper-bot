import { format } from "date-fns";

import { TG_CHAT_ID } from "src/config";

import { tgBot } from "./bot";

const set = new Set<string>();
let timeout: NodeJS.Timeout | null = null;

const send = () => {
  const result = Array.from(set)
    .map((x) => x.trim())
    .join("\n")
    .trim();
  if (result) {
    tgBot.api.sendMessage(TG_CHAT_ID, result).catch(console.error);
  }
  set.clear();
  timeout = null;
};

const add = (message: string) => {
  const time = new Date();

  if (!timeout) {
    timeout = setTimeout(send, 5 * 60 * 1000);
  }

  set.add(`${format(time, "HH:mm:ss")} ${message}`);

  if (set.size > 10) {
    send();
    clearTimeout(timeout);
  }
};

export const notify = (message: string, send?: boolean) => {
  // console.log(message);

  if (message.includes("\n") || send) {
    tgBot.api.sendMessage(TG_CHAT_ID, message).catch(console.error);
    return;
  }

  add(message);
};
