import { prisma } from "src/prisma";

export const blackList = new Set<string>();

export const initBlackList = async () => {
  const list = await prisma.blackList.findMany({ where: { type: "source" } });

  blackList.clear();

  list.forEach((x) => blackList.add(x.id));
};
