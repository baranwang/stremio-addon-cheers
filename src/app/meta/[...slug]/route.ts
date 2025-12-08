import type { ContentType, MetaDetail, MetaVideo } from "@stremio-addon/sdk";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import pLimit from "p-limit";
import { getSeasonDetail, getSeasonEpisode } from "@/lib/bilibili";
import { proxyAssetFactory } from "@/lib/proxy";
import { matchResourceRoute } from "@/lib/router";
import { resourceId } from "@/lib/utils";

const fetchSeasonEpisodes = async (seasonId: number, seasonNumber: number) => {
  const { episodes } = await getSeasonEpisode(seasonId);
  return episodes
    .filter((ep): ep is NonNullable<typeof ep> => !!ep)
    .map((ep, epIndex) => ({
      ...ep,
      seasonNumber,
      episodeNumber: epIndex + 1,
    }));
};

export async function GET(request: NextRequest) {
  const [matched, params] = matchResourceRoute(request.nextUrl);
  if (!matched) {
    return notFound();
  }
  const mediaId = params.id;
  if (!mediaId || !mediaId.startsWith("bilibili:")) {
    return notFound();
  }
  const mediaIdData = resourceId.parse<{ seasonId: string }>(mediaId);
  if (!mediaIdData.seasonId) {
    return notFound();
  }

  const proxyAsset = await proxyAssetFactory();

  const limit = pLimit(5);

  const detail = await getSeasonDetail(
    Number.parseInt(mediaIdData.seasonId, 10),
  );

  let seasonIds: number[] = [];
  if (detail.seasons.length > 1) {
    seasonIds = detail.seasons.map((item) => item.season_id);
  } else {
    seasonIds = [detail.season_id];
  }

  const episodes = await Promise.all(
    seasonIds.map((seasonId, index) =>
      limit(() => fetchSeasonEpisodes(seasonId, index + 1)),
    ),
  ).then((results) => results.flat());

  const videos = episodes.map<MetaVideo>((ep) => {
    return {
      id: resourceId.stringify({
        epId: ep.ep_id.toString(),
        cid: ep.cid.toString(),
      }),
      title: ep.show_title ?? ep.long_title ?? ep.title,
      released: ep.pub_time ?? "",
      thumbnail: proxyAsset(ep.cover),
      season: ep.seasonNumber,
      episode: ep.episodeNumber,
      overview: ep.long_title ?? ep.title,
    };
  });

  const meta: MetaDetail = {
    id: mediaId,
    type: params.type as ContentType,
    name: detail.series?.series_title ?? detail.title,
    poster: proxyAsset(detail.cover),
    background: proxyAsset(detail.bkg_cover),
    description: detail.evaluate ?? undefined,
    genres: detail.styles ?? undefined,
    videos,
  };

  return Response.json({ meta });
}
