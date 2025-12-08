import { z } from "zod";
import { createSuccessResponseSchema } from "../common";

export const getStreamRequestSchema = z.object({
  type: z.string().default("mp4"),
  platform: z.string().default("html5"),
  ep_id: z.coerce.number(),
  cid: z.coerce.number(),
  qn: z.number().default(16),
  fnval: z.number().default(16),
  fnver: z.literal(0).default(0),
  fourk: z.literal(1).default(1),
});

const streamUrlSchema = z.object({
  url: z.string(),
  backup_url: z.array(z.string()),
});

export type StreamUrl = z.infer<typeof streamUrlSchema>;

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
