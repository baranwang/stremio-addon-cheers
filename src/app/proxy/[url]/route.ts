import { BASE_HEADERS } from "@/lib/request/constants";

// 不应转发的 hop-by-hop 请求头
const OMIT_REQUEST_HEADERS = new Set([
  "host",
  "transfer-encoding",
  "te",
  "upgrade",
  "proxy-authorization",
  "proxy-connection",
]);

export async function GET(req: Request, ctx: RouteContext<"/proxy/[url]">) {
  const { url: urlString } = await ctx.params;

  let url: URL;
  try {
    url = new URL(decodeURIComponent(urlString));
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // 构建请求头：过滤 hop-by-hop 头并覆盖基础头
  let headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!OMIT_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });
  headers = Object.assign(headers, BASE_HEADERS);

  try {
    const response = await fetch(url, {
      method: req.method,
      signal: req.signal,
      headers,
    });

    return new Response(response.body, {
      headers: response.headers,
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Proxy request failed", { status: 502 });
  }
}
