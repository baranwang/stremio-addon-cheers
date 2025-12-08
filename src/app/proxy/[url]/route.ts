import { BASE_HEADERS } from "@/lib/request";

// 不应转发的 hop-by-hop 请求头
const OMIT_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "upgrade",
  "proxy-authorization",
  "proxy-connection",
]);

// 不应返回的响应头
const OMIT_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
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
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!OMIT_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  Object.entries(BASE_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  try {
    const response = await fetch(url, { headers });

    // 过滤响应头
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!OMIT_RESPONSE_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(response.body, {
      headers: responseHeaders,
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Proxy request failed", { status: 502 });
  }
}
