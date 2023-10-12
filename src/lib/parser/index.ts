export const parseUsername = (username: string) => {
  const usernameRegex = /\*\*(.*?)\*\*/g;

  return usernameRegex.exec(username)?.[1]?.trim();
};

type ParsedMessage =
  | {
      type: "unknown";
    }
  | {
      type: "inline";
      username: string;
      message: string;
    }
  | {
      type: "multiline";
      username: string;
      message: string;
    }
  | {
      type: "quote";
      username: string;
      message: string;
      quoteUsername: string;
      quote: string;
    };

export const parseMessage = (
  message: string,
  skipBold?: boolean
): ParsedMessage => {
  const [firstLine, ...lines] = message.split("\n");

  const usernameRegex = /\*\*(.*?)\*\*/g;

  if (firstLine.startsWith("Replying to ") && lines.length > 0) {
    const quoteUsername = firstLine
      .replace("Replying to ", "")
      .slice(0, -1)
      .trim();
    let [quoteStr, ...message] = lines;

    if (quoteStr.trim().startsWith(">")) {
      quoteStr = quoteStr.trim().slice(1).trim();
    }
    if (quoteStr.startsWith('"') && quoteStr.endsWith('"')) {
      quoteStr = quoteStr.slice(1, -1).trim();
    }

    return {
      type: "quote",
      username: "",
      message: message.join("\n").trim(),
      quoteUsername: quoteUsername,
      quote: quoteStr,
    };
  }

  if (
    firstLine.includes("):") &&
    firstLine.includes("(") &&
    lines.length === 0
  ) {
    const username = firstLine.split("(")[0].trim();

    let message = firstLine.split("):")[1].trim();

    if (message.startsWith('"') && message.endsWith('"')) {
      message = message.slice(1, -1).trim();
    }

    return {
      username: username,
      message: message,
      type: "inline",
    };
  }

  if (
    firstLine.startsWith("> ") &&
    firstLine.includes(":") &&
    lines.length > 2
  ) {
    const quoteUsername = firstLine.split(":")[0].replace(">", "").trim();
    let quote = firstLine.split(":")[1].trim();

    if (quote.startsWith('"') && quote.endsWith('"')) {
      quote = quote.slice(1, -1).trim();
    }

    const username = usernameRegex.exec(lines[1])?.[1]?.trim();

    if (!username) {
      return {
        type: "unknown",
      };
    }

    let message = lines.slice(2).join("\n").trim();

    if (message.startsWith('"') && message.endsWith('"')) {
      message = message.slice(1, -1).trim();
    }

    return {
      type: "quote",
      username: username,
      message: message,
      quoteUsername: quoteUsername,
      quote: quote,
    };
  }

  if (firstLine.includes(":") && lines.length === 0) {
    const splitted = firstLine.split(":");

    let username = usernameRegex.exec(splitted[0])?.[1]?.trim();

    if (!username && skipBold) {
      username = splitted[0].replace(">", "").trim();
    }

    if (!username) {
      return {
        type: "unknown",
      };
    }

    let message = splitted[1].trim();

    if (message.startsWith('"') && message.endsWith('"')) {
      message = message.slice(1, -1).trim();
    }

    return {
      username: username,
      message: message,
      type: "inline",
    };
  }
  if (lines.length > 0) {
    const username = usernameRegex.exec(firstLine)?.[1]?.trim();

    if (!username) {
      return {
        type: "unknown",
      };
    }

    if (lines[0].trim().startsWith(">")) {
      const [quoteStr, ...message] = lines;
      const quote = parseMessage(quoteStr, true);
      if (quote.type === "unknown") {
        return {
          username: username,
          message: lines.join("\n"),
          type: "multiline",
        };
      }

      return {
        type: "quote",
        username: username,
        message: message.join("\n"),
        quoteUsername: quote.username,
        quote: quote.message,
      };
    }

    let message = lines.join("\n").trim();

    if (message.startsWith('"') && message.endsWith('"')) {
      message = message.slice(1, -1).trim();
    }

    return {
      username: username,
      message: message,
      type: "multiline",
    };
  }

  return {
    type: "unknown",
  };
};
