import { syncAllChannels } from "./sync-channel";
import { syncAllFeedChannels } from "./sync-feed-channel";
import { initBlackList } from "./black-list";

export const init = async () => {
  await initBlackList();

  await new Promise((resolve) => setTimeout(resolve, 10000));

  await syncAllChannels();

  // await syncAllFeedChannels();
};
