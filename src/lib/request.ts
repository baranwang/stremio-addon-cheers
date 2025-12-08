import ky from "ky";
import { getConfig } from "./config";
import { stringifyCookies } from "./utils";

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

export const BASE_HEADERS = {
  Origin: "https://www.bilibili.com",
  Referer: "https://www.bilibili.com",
  "User-Agent": DEFAULT_USER_AGENT,
};

export const request = ky.create({
  prefixUrl: "https://api.bilibili.com",
  headers: BASE_HEADERS,
  hooks: {
    beforeRequest: [
      async (request) => {
        const cookies = await getConfig("cookies");
        if (cookies) {
          request.headers.set("Cookie", stringifyCookies(cookies));
        }
        console.info("⬆️ Request:", request.method, request.url);
      },
    ],
  },
});
