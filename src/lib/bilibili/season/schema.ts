import { z } from "zod";
import { createSuccessResponseSchema } from "../common";
import { DEFAULT_PAGE_SIZE, SeasonType } from "./constants";

export const seasonIndexRequestSchema = z.object({
  season_type: z.enum(SeasonType),
  season_version: z.string().optional().default("-1"),
  spoken_language_type: z.string().optional().default("-1"),
  is_finish: z.string().optional().default("-1"),
  copyright: z.string().optional().default("-1"),
  season_status: z.string().optional().default("-1"),
  season_month: z.string().optional().default("-1"),
  year: z.string().optional().default("-1"),
  style_id: z.string().optional().default("-1"),
  order: z.string().optional().default("0"),
  sort: z.string().optional().default("0"),
  area: z.string().optional().default("-1"),
  type: z.string().optional().default("0"),

  page: z.coerce.number().optional().default(1),
  pagesize: z.number().optional().default(DEFAULT_PAGE_SIZE),
});

export const seasonIndexItemSchema = z.object({
  title: z.string(),
  subTitle: z.string().nullish(),
  season_type: z.enum(SeasonType),
  cover: z.string(),
  first_ep: z
    .object({
      cover: z.string(),
    })
    .nullish(),
  media_id: z.number(),
  season_id: z.number(),
  score: z.coerce.number().nullish().catch(null),
});

export const seasonIndexResponseSchema = createSuccessResponseSchema(
  z.object({
    has_next: z.coerce.number(),
    list: z.array(seasonIndexItemSchema),
    num: z.coerce.number(),
    size: z.coerce.number(),
    total: z.coerce.number(),
  }),
);

export const seasonConditionRequestSchema = z.object({
  season_type: z.enum(SeasonType),
  type: z.number().optional().default(0),
});

export const seasonConditionResponseSchema = createSuccessResponseSchema(
  z.object({
    filter: z.array(
      z
        .object({
          field: z.union([
            z.literal("area"),
            z.literal("style_id"),
            z.literal("season_version"),
            z.literal("season_status"),
            z.literal("spoken_language_type"),
            z.literal("copyright"),
            z.literal("is_finish"),
          ]),
          name: z.string(),
          values: z.array(
            z.object({
              keyword: z.string(),
              name: z.string(),
            }),
          ),
        })
        .nullish()
        .catch(null),
    ),
    order: z.array(
      z.object({
        field: z.string(),
        name: z.string(),
        sort: z.string(),
      }),
    ),
  }),
);

export const seasonDetailResponseSchema = createSuccessResponseSchema(
  z.object({
    actors: z.string().nullish().catch(undefined),
    bkg_cover: z.string().nullish().catch(undefined),
    cover: z.string().nullish().catch(undefined),
    evaluate: z.string().nullish().catch(undefined),
    season_id: z.number(),
    season_title: z.string(),
    season_type: z.enum(SeasonType),
    seasons: z
      .array(
        z
          .object({
            season_id: z.number(),
            media_id: z.number(),
            season_title: z.string(),
            season_type: z.enum(SeasonType),
            cover: z.string().nullish().catch(undefined),
            horizontal_cover_169: z.string().nullish().catch(undefined),
            horizontal_cover_1610: z.string().nullish().catch(undefined),
          })
          .nullish()
          .catch(undefined),
      )
      .nullish()
      .transform(
        (v) =>
          v?.filter((item): item is NonNullable<typeof item> => !!item) ?? [],
      ),
    title: z.string(),
    series: z
      .object({
        series_id: z.number(),
        series_title: z.string(),
      })
      .nullish()
      .catch(undefined),
    styles: z.array(z.string()).nullish().catch(undefined),
  }),
  "result",
);

export const seasonEpisodeResponseSchema = createSuccessResponseSchema(
  z.object({
    episodes: z.array(
      z
        .object({
          aid: z.number(),
          cid: z.number(),
          ep_id: z.number(),
          pub_time: z
            .number()
            .nullish()
            .catch(undefined)
            .transform((v) => new Date((v ?? 0) * 1000).toISOString()),
          show_title: z.string(),
          title: z.string(),
          long_title: z.string().nullish().catch(undefined),
          cover: z.string().nullish().catch(undefined),
          duration: z.number().nullish().catch(undefined),
        })
        .nullish()
        .catch(undefined),
    ),
  }),
  "result",
);
