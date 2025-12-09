import ky from "ky";
import { getConfig } from "../config";
import { stringifyCookies } from "../utils";
import { BASE_HEADERS } from "./constants";

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
