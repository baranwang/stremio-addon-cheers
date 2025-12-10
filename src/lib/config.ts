"use server";

import type { SeasonType } from "./bilibili";
import { db } from "./db";

interface Config {
  cookies: Record<string, string>;
  assetProxy: boolean;
  pgcCatalogs: SeasonType[];
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

export const removeConfig = async <K extends keyof Config>(key: K) => {
  await db.remove(key);
};
