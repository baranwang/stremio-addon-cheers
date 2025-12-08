import { basicRequest } from "@/lib/request";

export async function GET(_req: Request, ctx: RouteContext<"/proxy/[url]">) {
  const { url: urlString } = await ctx.params;
  const url = new URL(decodeURIComponent(urlString));
  return basicRequest.get(url);
}
