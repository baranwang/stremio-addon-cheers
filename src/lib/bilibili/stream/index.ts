import type { z } from "zod";
import { request } from "@/lib/request";
import { getStreamRequestSchema, getStreamResponseSchema } from "./schema";

export const getStream = async (
  params: z.input<typeof getStreamRequestSchema>,
) => {
  const searchParams = getStreamRequestSchema.parse(params);
  const response = await request
    .get("pgc/player/web/playurl/html5", {
      searchParams,
    })
    .json();
  return getStreamResponseSchema.parse(response);
};
