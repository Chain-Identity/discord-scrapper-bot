import { channelByIdMap, channelByNameMap } from "./bot";

export const getChannelById = (channelId: string) => {
  const channel = channelByIdMap.get(channelId);

  if (!channel) {
    return null;
  }

  return channel;
};

export const getChannelByName = (channelName: string) => {
  const channel = channelByNameMap.get(channelName);

  if (!channel) {
    return null;
  }

  return channel;
};
