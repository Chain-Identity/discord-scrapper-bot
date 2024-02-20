import { pino } from "pino";

export const logger = pino({
  level: "trace",
  formatters: {
    level: (label) => {
      return {
        level: label,
      };
    },
  },
});
