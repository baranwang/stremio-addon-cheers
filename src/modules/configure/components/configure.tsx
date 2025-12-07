import { Suspense } from "react";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/item";
import { Spinner } from "@/components/spinner";
import type { UserInfo } from "@/lib/bilibili";
import { prisma } from "@/prisma";
import { AssetProxySwitch } from "./asset-proxy-switch";
import { ManifestUrl } from "./manifest-url";

interface ConfigureProps {
  userInfo: UserInfo;
}
export const Configure: React.FC<ConfigureProps> = async ({ userInfo }) => {
  const configs = await prisma.config.findMany().then((res) =>
    res.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, any>,
    ),
  );

  return (
    <div className="space-y-4">
      <ItemGroup className="bg-muted rounded-md">
        <Item>
          <ItemContent>
            <ItemTitle>Hi, {userInfo.uname}!</ItemTitle>
          </ItemContent>
        </Item>

        <ItemSeparator />
        <ManifestUrl />
      </ItemGroup>

      <Suspense fallback={<Spinner />}>
        <AssetProxySwitch value={configs.assetProxy} />
      </Suspense>
    </div>
  );
};
