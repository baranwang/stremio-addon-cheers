import type { Stream } from "@stremio-addon/sdk";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  getSeasonDetail,
  getSeasonEpisode,
  getSeasonIdsByDetail,
  getStream,
} from "@/lib/bilibili";
import { getConfig } from "@/lib/config";
import { getBaseUrl } from "@/lib/proxy";
import { matchResourceRoute } from "@/lib/router";
import { resourceId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const [matched, params] = matchResourceRoute(request.nextUrl);
  if (!matched) {
    notFound();
  }
  const streamIdData = resourceId.parse<
    | { epId: string; cid: string }
    | { seasonId: `${number}:${number}:${number}` }
  >(params.id);
  if (!streamIdData) {
    notFound();
  }

  let epId: string | undefined;
  let cid: string | undefined;
  if ("epId" in streamIdData) {
    epId = streamIdData.epId;
    cid = streamIdData.cid;
  } else {
    // 兼容一下 forward 的错误逻辑
    const [seasonId, seasonNumber, episodeNumber] =
      streamIdData.seasonId.split(":");
    const detail = await getSeasonDetail(Number(seasonId));
    const seasonIds = await getSeasonIdsByDetail(detail);
    const { episodes } = await getSeasonEpisode(
      seasonIds[Number.parseInt(seasonNumber, 10) - 1],
    );
    const ep = episodes[Number.parseInt(episodeNumber, 10) - 1];
    if (!ep) {
      notFound();
    }
    epId = ep.ep_id.toString();
    cid = ep.cid.toString();
  }

  if (!epId) {
    notFound();
  }

  const response = await getStream({ ep_id: epId, cid });

  const baseUrl = await getBaseUrl();

  const streams = response.support_formats.map<Stream>((format) => {
    let name = "";
    if (format.need_vip) {
      name = "[VIP] ";
    }
    name += format.new_description || format.description;
    const result: Stream = {
      name,
      url: `${baseUrl}/proxy/video/${epId}/${format.quality}`,
    };

    return result;
  });

  return Response.json({ streams });
}
