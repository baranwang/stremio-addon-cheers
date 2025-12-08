import ky from "ky";
import { getCookies } from "./bilibili";
import { stringifyCookies } from "./utils";

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

export const basicRequest = ky.create({
  prefixUrl: "https://api.bilibili.com",
  headers: {
    Origin: "https://www.bilibili.com",
    Referer: "https://www.bilibili.com",
    "User-Agent": DEFAULT_USER_AGENT,
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const cookies = await getCookies();
        if (cookies) {
          request.headers.set("Cookie", stringifyCookies(cookies));
        }
      },
    ],
  },
});

export const request = basicRequest.create({
  hooks: {
    beforeRequest: [
      (request) => {
        console.info("⬆️ Request:", request.method, request.url);
      },
    ],
  },
});
