import { APIMessage } from "discord-api-types/v9";
import { subDays } from "date-fns/subDays";
import { isBefore } from "date-fns/isBefore";
import { nanoid } from "nanoid";

import { sourceBotByChannelIdMap } from "./bot";
import { log } from "./log";

interface GetMessagesProps {
  channelId: string;
  lastSavedMessageId?: string;
  short?: boolean;
  lastNDays?: number;
}

export const getMessages = async ({
  channelId,
  lastSavedMessageId,
  short,
  lastNDays,
}: GetMessagesProps) => {
  const traceId = nanoid();
  const trace = log.child({
    traceId,
    channelId,
    lastSavedMessageId,
    short,
    lastNDays,
  });

  trace.debug("call getMessages");

  const result: APIMessage[] = [];

  const firstDate = lastNDays ? subDays(new Date(), lastNDays) : null;

  let lastMessage: string | undefined = undefined;
  while (true) {
    trace.debug(`Fetching messages...`);
    const sourceDBot = sourceBotByChannelIdMap.get(channelId);

    if (!sourceDBot) {
      trace.error(`No source bot for channel ${channelId}`);
      return [];
    }

    const messages = await sourceDBot.fetch_messages(
      ...([50, channelId, lastMessage].filter(Boolean) as [
        number,
        string,
        string
      ])
    );

    trace.debug(`Fetched ${messages.length} messages`);

    if (!Array.isArray(messages)) {
      trace.error(messages);
      return [];
    }

    const lastMessageIndex = messages.findIndex(
      (message) =>
        message.id === lastSavedMessageId ||
        (firstDate ? isBefore(new Date(message.timestamp), firstDate) : false)
    );

    const resultList =
      lastMessageIndex !== -1
        ? messages.splice(0, lastMessageIndex)
        : [...messages];

    result.push(...resultList.reverse());

    if (
      messages.length < 50 ||
      messages.length !== resultList.length ||
      short
    ) {
      trace.debug({ messages, resultList }, `No more messages`);
      break;
    }

    lastMessage = messages[messages.length - 1].id;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  trace.debug(`Fetched ${result.length} messages`);

  return result;
};
