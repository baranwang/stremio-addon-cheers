import { Suspense } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/item";
import { Spinner } from "@/components/spinner";
import type { UserInfo } from "@/lib/bilibili";
import { getConfig } from "@/lib/config";
import { getBaseUrl } from "@/lib/proxy";
import { AssetProxySwitch } from "./asset-proxy-switch";
import { CatalogsConfig } from "./catalogs-config";
import { LogoutButton } from "./logout-button";
import { ManifestUrl } from "./manifest-url";

interface ConfigureProps {
  userInfo: UserInfo;
}

export const Configure: React.FC<ConfigureProps> = async ({ userInfo }) => {
  const [baseUrl, assetProxy, pgcCatalogs] = await Promise.all([
    getBaseUrl(),
    getConfig("assetProxy"),
    getConfig("pgcCatalogs"),
  ]);

  return (
    <div className="space-y-6">
      {/* 用户信息 */}
      <ItemGroup className="bg-muted/50 rounded-xl border">
        <Item>
          <ItemContent>
            <ItemTitle>Hi, {userInfo.uname}</ItemTitle>
            <ItemDescription>{userInfo.sign as string}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <LogoutButton />
          </ItemActions>
        </Item>
      </ItemGroup>

      {/* Manifest URL */}
      <ItemGroup className="bg-muted/50 rounded-xl border">
        <ManifestUrl baseUrl={baseUrl} />
      </ItemGroup>

      {/* 设置 */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground px-1">设置</h2>
        <ItemGroup className="bg-muted/50 rounded-xl border">
          <Item>
            <ItemContent>
              <Suspense fallback={<Spinner />}>
                <AssetProxySwitch value={assetProxy} />
              </Suspense>
            </ItemContent>
          </Item>

          <ItemSeparator />

          <Item>
            <ItemContent>
              <CatalogsConfig value={pgcCatalogs ?? []} />
            </ItemContent>
          </Item>
        </ItemGroup>
      </div>
    </div>
  );
};
