import { tgBot } from "./bot";
import { log } from "./log";

export const launchTgBot = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  tgBot.start().catch((e) => log.error(e, "Telegram bot error"));

  await tgBot.api.setMyCommands([
    {
      command: "add_channel",
      description: "Add new channel",
    },
    {
      command: "add_bot",
      description: "Add new bot",
    },
    {
      command: "add_black_list",
      description: "Add author id to black list",
    },
    {
      command: "delete_black_list",
      description: "Delete author id from black list",
    },
    {
      command: "add_white_list",
      description: "Add author id to white list",
    },
    {
      command: "delete_white_list",
      description: "Delete author id from white list",
    },
    {
      command: "delete_channel",
      description: "Delete channel",
    },
    {
      command: "recreate_channel",
      description: "Recreate channel",
    },
    {
      command: "status",
      description: "Get status",
    },
    {
      command: "last_messages",
      description: "Get last messages",
    },
    {
      command: "ai",
      description: "Link channel to summary channel",
    },
    {
      command: "ai_ai_ai",
      description: "Send summary to summary channel",
    },
    {
      command: "add_feed",
      description: "Add source feed channel",
    },
    {
      command: "add_feed_channel",
      description: "Add target feed channel",
    },
  ]);

  log.info("Telegram bot started!");
};

export * from "./notify";
