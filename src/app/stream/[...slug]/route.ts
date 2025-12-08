import type { Stream } from "@stremio-addon/sdk";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { getCookies, getStream } from "@/lib/bilibili";
import { getBaseUrl } from "@/lib/proxy";
import { matchResourceRoute } from "@/lib/router";
import { resourceId } from "@/lib/utils";

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

  const response = await getStream({
    ep_id: streamData.epId,
    cid: streamData.cid,
  });

  const baseUrl = await getBaseUrl();

  const streams: Stream[] = response.support_formats.map((format) => {
    let name = "";
    if (format.need_vip) {
      name = "[VIP] ";
    }
    name += format.new_description || format.description;
    return {
      name,
      url: `${baseUrl}/proxy/video/${streamData.epId}/${format.quality}`,
    };
  });

  return Response.json({ streams });
}
