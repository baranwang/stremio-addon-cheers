"use server";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { prisma } from "@/prisma";

export const getConfigs = async () => {
  const configs = await prisma.config.findMany();
  return configs.reduce(
    (acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    },
    {} as Record<string, any>,
  );
};

export const getConfig = async <T>(key: string) => {
  const config = await prisma.config.findUnique({
    where: { key },
  });
  return config?.value as T;
};

export const saveConfig = async <T extends InputJsonValue>(
  key: string,
  value: T,
) => {
  const config = await prisma.config.upsert({
    create: { key, value },
    where: { key },
    update: { value },
  });
  return config.value as T;
};
