import { XMLBuilder } from "fast-xml-parser";
import { notFound } from "next/navigation";
import type { DashStreamItem } from "@/lib/bilibili";
import { getStream } from "@/lib/bilibili";
import { proxyAssetFactory } from "@/lib/proxy";

type ProxyAssetFn = Awaited<ReturnType<typeof proxyAssetFactory>>;

const createAdaptationSet = (
  item: DashStreamItem,
  contentType: "video" | "audio",
  proxyAsset: ProxyAssetFn,
) => ({
  "@_id": `${contentType}-${item.id}`,
  "@_contentType": contentType,
  "@_mimeType": item.mime_type,
  Representation: {
    "@_id": item.id,
    "@_bandwidth": item.bandwidth,
    "@_codecs": item.codecs,
    ...(contentType === "video" && {
      "@_width": item.width,
      "@_height": item.height,
      "@_startWithSAP": item.start_with_sap,
      "@_sar": item.sar,
      "@_frameRate": item.frame_rate,
    }),
    BaseURL: proxyAsset(item.base_url),
    SegmentBase: {
      "@_indexRange": item.segment_base.index_range,
      Initialization: {
        "@_range": item.segment_base.initialization,
      },
    },
  },
});

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
            ...dash.video
              .filter((item) => item.id.toString() === quality.toString())
              .map((v) => createAdaptationSet(v, "video", proxyAsset)),
            ...dash.audio.map((a) =>
              createAdaptationSet(a, "audio", proxyAsset),
            ),
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
