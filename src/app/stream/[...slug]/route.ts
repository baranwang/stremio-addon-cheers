import type { Stream } from "@stremio-addon/sdk";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { getCookies } from "@/lib/bilibili";
import { getStream } from "@/lib/bilibili/stream";
import { proxyAssetFactory } from "@/lib/proxy";
import { DEFAULT_USER_AGENT } from "@/lib/request";
import { matchResourceRoute } from "@/lib/router";
import { resourceId, stringifyCookies } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const [matched, params] = matchResourceRoute(request.nextUrl);
  if (!matched) {
    return notFound();
  }
  const streamData = resourceId.parse<{ epId: string; cid: string }>(params.id);
  if (!streamData.epId && !streamData.cid) {
    return notFound();
  }

  const cookies = await getCookies();
  if (!cookies) {
    return notFound();
  }

  const streamResp = await getStream({
    ep_id: streamData.epId,
    cid: streamData.cid,
  });

  const streams: Stream[] = [];

  const supportFormats = Object.fromEntries(
    streamResp.support_formats.map((format) => [format.quality, format]),
  );

  const urls = [
    {
      quality: streamResp.quality,
      durl: streamResp.durl,
    },
    ...streamResp.durls,
  ];

  const proxyAsset = await proxyAssetFactory();

  for (const item of urls) {
    const format = supportFormats[item.quality];
    let name = "";
    if (format.need_vip) {
      name = "[VIP] ";
    }
    name += format.new_description || format.description;
    streams.push({
      name,
      url: proxyAsset(item.durl[0].url),
      behaviorHints: {
        proxyHeaders: {
          request: {
            "User-Agent": DEFAULT_USER_AGENT,
            Referer: "https://www.bilibili.com/",
            Origin: "https://www.bilibili.com/",
            Cookie: stringifyCookies(cookies),
          },
        },
      },
    });
  }

  return Response.json({ streams });
}
