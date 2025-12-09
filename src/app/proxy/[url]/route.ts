import { Writable } from "node:stream";
import { Agent, stream } from "undici";
import { BASE_HEADERS } from "@/lib/request/constants";

const agent = new Agent({
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 60_000,
  pipelining: 1,
});

const OMIT_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
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

  const headers: Record<string, string> = { ...BASE_HEADERS };
  req.headers.entries().forEach(([key, value]) => {
    if (!OMIT_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  const abortController = new AbortController();

  return new Promise<Response>((resolve, reject) => {
    let streamController: ReadableStreamDefaultController<Uint8Array>;
    let controllerClosed = false;

    // 手动创建 ReadableStream，完全控制生命周期
    const readableStream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
      cancel() {
        // 客户端断开时触发
        controllerClosed = true;
        abortController.abort();
      },
    });

    // 创建 Writable 流接收 undici 数据
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        if (controllerClosed) {
          callback();
          return;
        }
        try {
          streamController.enqueue(chunk);
          callback();
        } catch {
          controllerClosed = true;
          abortController.abort();
          callback();
        }
      },
      final(callback) {
        if (!controllerClosed) {
          try {
            streamController.close();
          } catch {}
        }
        controllerClosed = true;
        callback();
      },
      destroy(_err, callback) {
        controllerClosed = true;
        callback(null);
      },
    });

    stream(
      url,
      {
        method: "GET",
        headers,
        dispatcher: agent,
        signal: abortController.signal,
      },
      ({ statusCode, headers: resHeaders }) => {
        const responseHeaders = new Headers();
        Object.entries(resHeaders).forEach(([key, value]) => {
          if (!OMIT_HEADERS.has(key.toLowerCase())) {
            responseHeaders.set(
              key,
              Array.isArray(value) ? value.join(", ") : (value ?? ""),
            );
          }
        });
        resolve(
          new Response(readableStream, {
            status: statusCode,
            headers: responseHeaders,
          }),
        );
        return writable;
      },
    ).catch((error) => {
      if (!controllerClosed) {
        controllerClosed = true;
        try {
          streamController.close();
        } catch {}
      }

      if (
        error.name === "AbortError" ||
        error.code === "UND_ERR_ABORTED" ||
        error.message?.includes("ResponseAborted")
      ) {
        return;
      }

      console.error("Proxy error:", error);
      reject(new Response("Proxy request failed", { status: 502 }));
    });
  });
}
