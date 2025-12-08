import { XMLBuilder } from "fast-xml-parser";
import { notFound } from "next/navigation";
import { getStream } from "@/lib/bilibili";
import { proxyAssetFactory } from "@/lib/proxy";

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
    fnval: quality,
  });

  const proxyAsset = await proxyAssetFactory();

  if (response.type === "MP4") {
    return Response.redirect(proxyAsset(response.durl[0].url)!, 307);
  }

  if (response.type === "DASH") {
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
        "@_mediaPresentationDuration": `PT${response.dash.duration}S`,
        "@_minBufferTime": `PT${response.dash.min_buffer_time}S`,

        Period: {
          "@_duration": `PT${response.dash.duration}S`,
          AdaptationSet: [
            ...response.dash.video.map((video) => ({
              "@_id": `video-${video.id}`,
              "@_contentType": "video",
              "@_mimeType": video.mime_type,
              Representation: {
                "@_id": video.id,
                "@_bandwidth": video.bandwidth,
                "@_codecs": video.codecs,
                "@_width": video.width,
                "@_height": video.height,
                "@_frameRate": video.frame_rate,
                BaseURL: proxyAsset(video.base_url),
                SegmentBase: {
                  "@_indexRange": video.segment_base.index_range,
                  Initialization: {
                    "@_range": video.segment_base.initialization,
                  },
                },
              },
            })),
            ...response.dash.audio.map((audio) => ({
              "@_id": `audio-${audio.id}`,
              "@_contentType": "audio",
              "@_mimeType": audio.mime_type,
              Representation: {
                "@_id": audio.id,
                "@_bandwidth": audio.bandwidth,
                "@_codecs": audio.codecs,
                BaseURL: proxyAsset(audio.base_url),
                SegmentBase: {
                  "@_indexRange": audio.segment_base.index_range,
                  Initialization: {
                    "@_range": audio.segment_base.initialization,
                  },
                },
              },
            })),
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
