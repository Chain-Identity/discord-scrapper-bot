import { channelByIdMap, feedByNameMap } from "./bot";

export const getChannelById = (channelId: string) => {
  const channel = channelByIdMap.get(channelId);

  if (!channel) {
    return null;
  }

  return channel;
};

export const getFeedByName = (channelName: string) => {
  const channel = feedByNameMap.get(channelName);

  if (!channel) {
    return null;
  }

  return channel;
};
