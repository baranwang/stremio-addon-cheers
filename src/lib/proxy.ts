import { headers } from "next/headers";
import { prisma } from "@/prisma";

export const proxyAssetFactory = async () => {
  const config = await prisma.config.findUnique({
    where: {
      key: "assetProxy",
    },
  });
  const assetProxy = config?.value as boolean;
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const fullUrl = `${protocol}://${host}`;

  return (url?: string | null) => {
    if (!url) return undefined;
    if (assetProxy) {
      return `${fullUrl}/proxy/${encodeURIComponent(url)}`;
    }
    return url;
  };
};
