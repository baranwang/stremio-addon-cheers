"use server";

import { prisma } from "@/prisma";

export const saveAssetProxySwitch = async (
  _previousState: boolean,
  value: boolean,
) => {
  const config = await prisma.config.upsert({
    create: { key: "assetProxy", value: value },
    where: { key: "assetProxy" },
    update: { value: value },
  });
  return config.value as boolean;
};
