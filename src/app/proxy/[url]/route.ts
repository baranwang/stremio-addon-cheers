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
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!OMIT_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  const response = await fetch(url, {
    headers: {
      ...headers,
      ...BASE_HEADERS,
    },
  });

  // 直接复制响应头，移除 content-length 避免长度不匹配错误
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
