import { request } from "@/lib/request";

export async function GET(_req: Request, ctx: RouteContext<"/proxy/[url]">) {
  const { url: urlString } = await ctx.params;
  const url = new URL(decodeURIComponent(urlString));
  const response = await request.get(url);
  response.headers.set(
    "Cache-Control",
    "public, max-age=3600, stale-while-revalidate=86400",
  );
  return response;
}
