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
import { getConfig } from "@/lib/config";
import { AssetProxySwitch } from "./asset-proxy-switch";
import { FnvalSetting } from "./fnval-setting";
import { ManifestUrl } from "./manifest-url";

interface ConfigureProps {
  userInfo: UserInfo;
}
export const Configure: React.FC<ConfigureProps> = async ({ userInfo }) => {
  const [assetProxy, fnval] = await Promise.all([
    getConfig("assetProxy"),
    getConfig("fnval"),
  ]);

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
        <AssetProxySwitch value={assetProxy} />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <FnvalSetting value={fnval} />
      </Suspense>
    </div>
  );
};
