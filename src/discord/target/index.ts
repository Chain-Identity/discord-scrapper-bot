import { TARGET_BOT_TOKEN } from "src/config";

import { targetDBot } from "./bot";

import { init } from "./init";

export const launchTargetDBot = async () => {
  try {
    console.log("launch target bot " + TARGET_BOT_TOKEN);
    await targetDBot.login(TARGET_BOT_TOKEN);

    console.log("Discord Target bot started!");

    init();
  } catch (e) {
    console.error(e);
  }
};

export * from "./add-channel";
export * from "./sync-channel";
export * from "./sync-from-feed";
export * from "./message-q";
