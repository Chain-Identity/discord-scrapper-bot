import { syncAllChannels } from "./sync-channel";

export const init = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  await syncAllChannels();
};
