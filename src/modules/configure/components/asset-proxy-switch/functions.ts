"use server";

import { saveConfig } from "@/lib/config";

export const saveAssetProxySwitch = async (
  _previousState: boolean,
  value: boolean,
) => {
  return saveConfig("assetProxy", value);
};
