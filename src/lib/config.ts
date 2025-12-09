"use server";

import { db } from "./db";

interface Config {
  cookies: Record<string, string>;
  assetProxy: boolean;
}

export const getConfig = async <K extends keyof Config>(key: K) => {
  return db.get(key) as Config[K];
};

export const saveConfig = async <K extends keyof Config>(
  key: K,
  value: Config[K],
) => {
  await db.put(key, value);
  return value;
};
