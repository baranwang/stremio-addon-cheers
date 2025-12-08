import type { Stream } from "@stremio-addon/sdk";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { getCookies, getStream, type StreamUrl } from "@/lib/bilibili";
import { proxyAssetFactory } from "@/lib/proxy";
import { DEFAULT_USER_AGENT } from "@/lib/request";
import { matchResourceRoute } from "@/lib/router";
import { resourceId, stringifyCookies } from "@/lib/utils";
import { prisma } from "@/prisma";

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
  console.log(streamResp);

  const streams: Stream[] = [];

  const supportFormats = Object.fromEntries(
    streamResp.support_formats.map((format) => [format.quality, format]),
  );

  const urlMap = new Map<number, StreamUrl[]>();

  urlMap.set(streamResp.quality, streamResp.durl);
  for (const item of streamResp.durls) {
    urlMap.set(item.quality, item.durl);
  }

  const proxyAsset = await proxyAssetFactory();
  const assetProxyConfig = await prisma.config.findUnique({
    where: {
      key: "assetProxy",
    },
  });

  for (const [quality, urls] of urlMap.entries()) {
    const format = supportFormats[quality];
    let name = "";
    if (format.need_vip) {
      name = "[VIP] ";
    }
    name += format.new_description || format.description;
    const result: Stream = {
      name,
      url: proxyAsset(urls[0].url),
      externalUrl: `https://www.bilibili.com/bangumi/play/ep${streamData.epId}`,
    };
    result.behaviorHints ||= {};
    if (assetProxyConfig?.value) {
      result.behaviorHints.notWebReady = false;
    } else {
      result.behaviorHints.proxyHeaders = {
        request: {
          "User-Agent": DEFAULT_USER_AGENT,
          Referer: "https://www.bilibili.com/",
          Origin: "https://www.bilibili.com/",
          Cookie: stringifyCookies(cookies),
        },
      };
    }
    streams.push(result);
  }

  return Response.json({ streams });
}
