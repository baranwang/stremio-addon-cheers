"use server";

import type { SeasonType } from "@/lib/bilibili";
import { saveConfig } from "@/lib/config";

export const savePgcCatalogs = async (
  _previousState: SeasonType[],
  formData: FormData,
) => {
  const catalogs = formData.getAll("catalog").map(Number) as SeasonType[];
  return saveConfig("pgcCatalogs", catalogs);
};
