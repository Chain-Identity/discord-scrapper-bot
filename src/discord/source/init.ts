import { syncAllChannels } from "./sync-channel";
import { syncAllFeedChannels } from './sync-feed-channel'

export const init = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  
  await syncAllChannels();

  await syncAllFeedChannels();
};
