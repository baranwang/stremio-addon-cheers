import { z } from "zod";

export const createSuccessResponseSchema = <
  T extends z.ZodType,
  K extends string = "data",
>(
  dataSchema: T,
  dataKey: K = "data" as K,
) => {
  return z
    .object({
      code: z.int(),
      [dataKey]: dataSchema,
    })
    .transform((v) => v[dataKey] as z.output<typeof dataSchema>);
};
