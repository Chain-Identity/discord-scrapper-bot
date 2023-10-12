import { APIMessage } from "discord-api-types/v8";

import { sourceDBot } from "./bot";

interface GetMessagesProps {
  channelId: string;
  lastSavedMessageId?: string;
}

export const getMessages = async ({
  channelId,
  lastSavedMessageId,
}: GetMessagesProps) => {
  const result: APIMessage[] = [];

  let lastMessage: string | undefined = undefined;
  while (true) {
    console.log(`Fetching messages from ${channelId}...`);
    const messages = await sourceDBot.fetch_messages(
      ...([50, channelId, lastMessage].filter(Boolean) as [
        number,
        string,
        string
      ])
    );

    if (!Array.isArray(messages)) {
      console.error(messages);
      return [];
    }

    const lastMessageIndex = messages.findIndex(
      (message) => message.id === lastSavedMessageId
    );

    const resultList =
      lastMessageIndex !== -1
        ? messages.splice(0, lastMessageIndex)
        : [...messages];

    result.push(...resultList.reverse());

    if (messages.length < 50 || messages.length !== resultList.length) {
      break;
    }

    lastMessage = messages[messages.length - 1].id;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return result;
};
