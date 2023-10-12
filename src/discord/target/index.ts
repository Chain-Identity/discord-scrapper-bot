import { TARGET_BOT_TOKEN } from "src/config";

import { targetDBot } from "./bot";

import { init } from "./init";

export const launchTargetDBot = async () => {
  await targetDBot.login(TARGET_BOT_TOKEN);

  console.log("Discord Target bot started!");

  init();
};

export * from "./add-channel";
export * from "./sync-channel";
export * from "./message-q";
