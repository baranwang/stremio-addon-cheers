import { z } from "zod";
import { createSuccessResponseSchema } from "../common";

export const generateQrCodeResponseSchema = createSuccessResponseSchema(
  z.object({
    url: z.string(),
    qrcode_key: z.string(),
  }),
);

export const checkQrCodeStatusResponseSchema = createSuccessResponseSchema(
  z.looseObject({
    url: z.string(),
    refresh_token: z.string(),
    code: z.int(),
    message: z.string(),
  }),
);

export const getUserInfoResponseSchema = createSuccessResponseSchema(
  z.looseObject({
    userid: z.string(),
    uname: z.string(),
  }),
);
