import type { z } from "zod";
import { request } from "@/lib/request";
import {
  seasonConditionRequestSchema,
  seasonConditionResponseSchema,
  seasonDetailResponseSchema,
  seasonEpisodeResponseSchema,
  seasonIndexRequestSchema,
  seasonIndexResponseSchema,
} from "./schema";

export * from "./constants";

export type SeasonIndexRequest = z.input<typeof seasonIndexRequestSchema>;
export const getSeasonIndex = async (params: SeasonIndexRequest) => {
  const searchParams = seasonIndexRequestSchema.parse(params);

  const response = await request
    .get("pgc/season/index/result", {
      searchParams,
      next: {
        revalidate: 60 * 60,
        tags: ["season-index", JSON.stringify(searchParams)],
      },
    })
    .json();
  return seasonIndexResponseSchema.parse(response);
};

export const getSeasonCondition = async (
  params: z.input<typeof seasonConditionRequestSchema>,
) => {
  const searchParams = seasonConditionRequestSchema.parse(params);
  const response = await request
    .get("pgc/season/index/condition", {
      searchParams,
      next: {
        revalidate: 60 * 60,
        tags: ["season-condition", searchParams.season_type.toString()],
      },
    })
    .json();
  return seasonConditionResponseSchema.parse(response);
};

export const getSeasonDetail = async (season_id: number) => {
  const response = await request
    .get("pgc/view/web/simple/season", {
      searchParams: { season_id },
      next: {
        revalidate: 60 * 60,
        tags: ["season-detail", season_id.toString()],
      },
    })
    .json();
  return seasonDetailResponseSchema.parse(response);
};

export const getSeasonIdsByDetail = async (
  detail: z.output<typeof seasonDetailResponseSchema>,
) => {
  if (detail.seasons.length > 1) {
    return detail.seasons.map((season) => season.season_id);
  }
  return [detail.season_id];
};

export const getSeasonEpisode = async (season_id: number) => {
  const response = await request
    .get("pgc/view/web/ep/list", {
      searchParams: { season_id },
      next: {
        revalidate: 60 * 60,
        tags: ["season-episode", season_id.toString()],
      },
    })
    .json();
  return seasonEpisodeResponseSchema.parse(response);
};
export type SeasonEpisodeResponse = z.output<
  typeof seasonEpisodeResponseSchema
>;
