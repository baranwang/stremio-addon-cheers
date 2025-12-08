"use server";

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

interface Config {
  cookies: Record<string, string>;
  assetProxy: boolean;
  fnval: number;
}

export const getConfig = async <K extends keyof Config>(key: K) => {
  const config = await prisma.config.findUnique({
    where: { key },
  });
  return config?.value as Config[K];
};

export const saveConfig = async <K extends keyof Config>(
  key: K,
  value: Config[K],
) => {
  const config = await prisma.config.upsert({
    create: { key, value },
    where: { key },
    update: { value: value },
  });
  return config.value as Config[K];
};
