import { groupBy } from "es-toolkit";
import { XMLBuilder } from "fast-xml-parser";
import { notFound } from "next/navigation";
import type { DashStreamItem } from "@/lib/bilibili";
import { getStream } from "@/lib/bilibili";
import { proxyAssetFactory } from "@/lib/proxy";

type ProxyAssetFn = Awaited<ReturnType<typeof proxyAssetFactory>>;

const createAdaptationSet = (
  contentType: "video" | "audio",
  dashItems: DashStreamItem[],
  proxyAsset: ProxyAssetFn,
) => {
  const groupedItems = groupBy(dashItems, (item) => item.mime_type);
  return Object.entries(groupedItems).map(([key, items]) => {
    return {
      "@_id": `${contentType}-${key}`,
      "@_contentType": contentType,
      "@_mimeType": items[0].mime_type,
      Representation: items.map((item) => ({
        "@_id": `${item.id}-${item.codecs}`,
        "@_bandwidth": item.bandwidth,
        "@_codecs": item.codecs,
        ...(contentType === "video" && {
          "@_width": item.width,
          "@_height": item.height,
          "@_startWithSAP": item.start_with_sap,
          "@_sar": item.sar,
          "@_frameRate": item.frame_rate,
        }),
        BaseURL: [
          {
            "@_serviceLocation": "main",
            "@_priority": 1,
            "#text": proxyAsset(item.base_url) ?? "",
          },
          ...(item.backup_url ?? []).map((url, index) => ({
            "@_serviceLocation": `backup_${index + 1}`,
            "@_priority": index + 2,
            "#text": proxyAsset(url) ?? "",
          })),
        ],
        SegmentBase: {
          "@_indexRange": item.segment_base.index_range,
          Initialization: {
            "@_range": item.segment_base.initialization,
          },
        },
      })),
    };
  });
};

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
});

export async function GET(
  _request: Request,
  ctx: RouteContext<"/proxy/video/[epId]/[quality]">,
) {
  const { epId, quality } = await ctx.params;

  const response = await getStream({
    ep_id: epId,
    qn: quality,
  });

  const proxyAsset = await proxyAssetFactory();

  if (response.type === "MP4") {
    const url = proxyAsset(response.durl[0].url);
    if (!url) return notFound();
    return Response.redirect(url, 307);
  }

  if (response.type === "DASH") {
    const { dash } = response;
    const manifest = xmlBuilder.build({
      "?xml": {
        "@_version": "1.0",
        "@_encoding": "utf-8",
      },
      MPD: {
        "@_xmlns": "urn:mpeg:dash:schema:mpd:2011",
        "@_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@_xsi:schemaLocation": "urn:mpeg:DASH:schema:MPD:2011 DASH-MPD.xsd",
        "@_profiles": "urn:mpeg:dash:profile:isoff-on-demand:2011",
        "@_type": "static",
        "@_mediaPresentationDuration": `PT${dash.duration}S`,
        "@_minBufferTime": `PT${dash.min_buffer_time}S`,
        Period: {
          "@_duration": `PT${dash.duration}S`,
          AdaptationSet: [
            ...createAdaptationSet(
              "video",
              dash.video.filter(
                (item) => item.id.toString() === quality.toString(),
              ),
              proxyAsset,
            ),
            ...createAdaptationSet("audio", dash.audio, proxyAsset),
          ],
        },
      },
    });
    return new Response(manifest, {
      headers: {
        "Content-Type": "application/dash+xml",
      },
    });
  }

  notFound();
}
