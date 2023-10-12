import cron from 'node-cron'

import { syncAllChannels } from "./sync-channel";
import { sendAllSummaries } from './summary'

export const init = async () => {
  await syncAllChannels();

  cron.schedule('0 8 * * *', async () => {
    await sendAllSummaries()
  });
};
