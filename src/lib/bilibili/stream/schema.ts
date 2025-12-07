import { z } from "zod";
import { createSuccessResponseSchema } from "../common";

export const getStreamRequestSchema = z.object({
  type: z.string().default("mp4"),
  ep_id: z.coerce.number(),
  cid: z.coerce.number(),
  qn: z.number().default(64 | 74 | 80 | 112 | 116 | 120),
  fnval: z.number().default(0),
  fnver: z.literal(0).default(0),
});

const streamUrlSchema = z.object({
  url: z.string(),
  backup_url: z.array(z.string()),
});

export const getStreamResponseSchema = createSuccessResponseSchema(
  z.object({
    durl: z.array(streamUrlSchema),
    quality: z.number(),
    support_formats: z.array(
      z.object({
        need_vip: z.boolean().nullish().catch(false),
        description: z.string(),
        new_description: z.string().nullish().catch(undefined),
        quality: z.number(),
      }),
    ),
    durls: z.array(
      z.object({
        durl: z.array(streamUrlSchema),
        quality: z.number(),
      }),
    ),
  }),
  "result",
);
