import { z } from "zod";
import { createSuccessResponseSchema } from "../common";
import { FnvalType } from "./constants";

export const getStreamRequestSchema = z.object({
  type: z.union([z.literal("mp4"), z.literal("dash")]).optional(),
  platform: z.string().optional(),
  ep_id: z.coerce.number(),
  cid: z.coerce.number().optional(),
  qn: z.coerce.number().default(64),
  fnval: z.coerce.number().default(FnvalType.DASH),
  fnver: z.literal(0).default(0),
  fourk: z.literal(1).default(1),
});

const streamUrlSchema = z.object({
  url: z.string(),
  backup_url: z.array(z.string()),
});

export type StreamUrl = z.infer<typeof streamUrlSchema>;

const supportFormatsSchema = z.array(
  z.object({
    need_vip: z.boolean().nullish().catch(false),
    description: z.string(),
    new_description: z.string().nullish().catch(undefined),
    quality: z.number(),
  }),
);

const streamMp4ResponseSchema = z.object({
  type: z.literal("MP4"),
  durl: z.array(streamUrlSchema),
  quality: z.number(),
  support_formats: supportFormatsSchema,
  durls: z.array(
    z.object({
      durl: z.array(streamUrlSchema),
      quality: z.number(),
    }),
  ),
});

const dashStreamItemSchema = z.object({
  id: z.number(),
  bandwidth: z.number(),
  codecs: z.string(),
  base_url: z.string(),
  segment_base: z.object({
    initialization: z.string(),
    index_range: z.string(),
  }),
  mime_type: z.string(),
  width: z.number(),
  height: z.number(),
  frame_rate: z.string(),
});

export type DashStreamItem = z.infer<typeof dashStreamItemSchema>;

const dashInfoSchema = z.object({
  duration: z.number(),
  min_buffer_time: z.number(),
  video: z.array(dashStreamItemSchema),
  audio: z.array(dashStreamItemSchema),
});

export type DashInfo = z.infer<typeof dashInfoSchema>;

const streamDashResponseSchema = z.object({
  type: z.literal("DASH"),
  support_formats: supportFormatsSchema,
  dash: dashInfoSchema,
});

export const getStreamResponseSchema = createSuccessResponseSchema(
  z.union([streamMp4ResponseSchema, streamDashResponseSchema]),
  "result",
);
