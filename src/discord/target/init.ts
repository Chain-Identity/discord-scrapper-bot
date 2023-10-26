import cron from 'node-cron'

import { syncAllChannels } from "./sync-channel";
import { syncAllChannelsFromFeed } from "./sync-from-feed";
import { sendAllSummaries } from './summary'

export const init = async () => {
  await syncAllChannels();

  await syncAllChannelsFromFeed();

  cron.schedule('0 8 * * *', async () => {
    await sendAllSummaries()
  });
};
