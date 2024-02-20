import { launchTgBot } from "./telegram";
import { launchSourceDBot } from "./discord/source";
import { launchTargetDBot } from "./discord/target";
import { logger } from "./logger";

logger.info("Starting application");

await Promise.all([launchTgBot(), launchSourceDBot(), launchTargetDBot()]);
