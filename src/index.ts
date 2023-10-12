import { launchTgBot } from "./telegram";
import { launchSourceDBot } from "./discord/source";
import { launchTargetDBot } from "./discord/target";

console.log("Starting...");

await Promise.all([launchTgBot(), launchSourceDBot(), launchTargetDBot()]);
