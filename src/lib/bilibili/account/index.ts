"use server";

import type { z } from "zod";
import { saveCookies } from "@/lib/bilibili/cookies";
import { request } from "@/lib/request";
import {
  checkQrCodeStatusResponseSchema,
  generateQrCodeResponseSchema,
  getUserInfoResponseSchema,
} from "./schema";

export const generateQrCode = async () => {
  const response = await request
    .get(
      new URL(
        "https://passport.bilibili.com/x/passport-login/web/qrcode/generate",
      ),
    )
    .json();
  return generateQrCodeResponseSchema.parse(response);
};

export const checkQrCodeStatus = async (qrcode_key: string) => {
  const response = await request.get(
    new URL("https://passport.bilibili.com/x/passport-login/web/qrcode/poll"),
    {
      searchParams: {
        qrcode_key,
      },
    },
  );
  const data = checkQrCodeStatusResponseSchema.parse(await response.json());
  if (data.code === 0) {
    const cookies: Record<string, string> = {};
    for (const cookie of response.headers.getSetCookie()) {
      const [nameValue] = cookie.split(";");
      const [name, value] = nameValue.split("=");
      cookies[name] = value;
    }
    await saveCookies(cookies);
  }
  return data;
};

export const getUserInfo = async () => {
  const response = await request.get("x/member/web/account").json();
  return getUserInfoResponseSchema.parse(response);
};

export type UserInfo = z.output<typeof getUserInfoResponseSchema>;
