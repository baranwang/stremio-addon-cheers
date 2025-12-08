import { headers } from "next/headers";
import { getConfig } from "./config";

export const getBaseUrl = async () => {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  return `${protocol}://${host}`;
};

export const proxyAssetFactory = async () => {
  const assetProxy = await getConfig<boolean>("assetProxy");
  const baseUrl = await getBaseUrl();

  return (url?: string | null) => {
    if (!url) return undefined;
    if (assetProxy) {
      return `${baseUrl}/proxy/${encodeURIComponent(url)}`;
    }
    return url;
  };
};
