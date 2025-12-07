import type { MetaPreview } from "@stremio-addon/sdk";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  DEFAULT_PAGE_SIZE,
  getSeasonCondition,
  getSeasonIndex,
  type SeasonIndexRequest,
  type SeasonType,
} from "@/lib/bilibili";
import { proxyAssetFactory } from "@/lib/proxy";
import { matchResourceRoute } from "@/lib/router";
import { resourceId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const [matched, params] = matchResourceRoute(request.nextUrl);
  if (!matched) {
    return notFound();
  }

  const seasonType = Number.parseInt(params.id, 10) as SeasonType;

  const seasonCondition = await getSeasonCondition({ season_type: seasonType });

  const seasonIndexRequest: SeasonIndexRequest = {
    season_type: seasonType,
    order: seasonCondition.order?.[0].field,
    page:
      Math.floor(
        Number.parseInt(params.extra?.skip ?? "0", 10) / DEFAULT_PAGE_SIZE,
      ) + 1,
  };
  const genre = params.extra?.genre;

  for (const filter of seasonCondition.filter ?? []) {
    if (!filter) continue;
    if (filter.field === "style_id" && genre) {
      seasonIndexRequest.style_id = filter.values.find(
        (option) => option.name === genre,
      )?.keyword;
    } else {
      seasonIndexRequest[filter.field] = filter.values?.[0].keyword;
    }
  }

  const seasonIndex = await getSeasonIndex(seasonIndexRequest);
  const metas: MetaPreview[] = [];
  const proxyAsset = await proxyAssetFactory();

  for (const item of seasonIndex.list) {
    metas.push({
      id: resourceId.stringify({ seasonId: item.season_id.toString() }),
      name: item.title,
      type: "series",
      poster: proxyAsset(item.cover),
      background: proxyAsset(item.first_ep?.cover),
      description: item.subTitle ?? undefined,
    });
  }
  return Response.json({ metas });
}
