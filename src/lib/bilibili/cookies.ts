"use server";

import { prisma } from "@/prisma";

export const getCookies = async () => {
  const config = await prisma.config.findUnique({
    where: { key: "cookies" },
  });
  return config?.value as Record<string, string>;
};

export const saveCookies = async (cookies: Record<string, string>) => {
  await prisma.config.upsert({
    create: { key: "cookies", value: cookies },
    where: { key: "cookies" },
    update: { value: cookies },
  });
};
