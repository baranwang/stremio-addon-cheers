"use server";

import { revalidatePath } from "next/cache";
import { removeConfig } from "@/lib/config";

export const logout = async () => {
  await removeConfig("cookies");
  revalidatePath("/configure");
};
