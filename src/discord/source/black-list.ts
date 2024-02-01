import { prisma } from "src/prisma";

export const blackList = new Set<string>();

export const whiteList = new Set<string>();

export const initBlackList = async () => {
  const list = await prisma.blackList.findMany({ where: { type: "source" } });

  blackList.clear();

  list.forEach((x) => blackList.add(x.id));

  const list2 = await prisma.whiteList.findMany({ where: { type: "source" } });

  whiteList.clear();

  list2.forEach((x) => whiteList.add(x.id));
};
