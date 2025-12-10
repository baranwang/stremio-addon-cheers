import type { Manifest, ManifestCatalog } from "@stremio-addon/sdk";
import { NextResponse } from "next/server";
import pkg from "@/../package.json" with { type: "json" };
import {
  DEFAULT_PAGE_SIZE,
  getSeasonCondition,
  getSeasonIndex,
  SeasonType,
  SeasonTypeText,
} from "@/lib/bilibili";
import { getConfig } from "@/lib/config";

async function buildCatalog(
  catalog: ManifestCatalog,
): Promise<ManifestCatalog> {
  const result: ManifestCatalog = { ...catalog, extra: [] };
  const seasonType = Number.parseInt(catalog.id, 10) as SeasonType;
  try {
    const { filter } = await getSeasonCondition({ season_type: seasonType });
    const styleFilter = filter.find((f) => f?.field === "style_id");
    if (styleFilter) {
      result.extra ||= [];
      result.extra.push({
        name: "genre",
        options: styleFilter.values.map((v) => v.name),
      });
    }
  } catch (error) {
    console.warn(`Failed to fetch condition for catalog ${catalog.id}:`, error);
  }
  return result;
}

export async function GET() {
  const pgcCatalogs = await getConfig("pgcCatalogs");
  const catalogs = await Promise.all(
    pgcCatalogs.map((item) =>
      buildCatalog({
        id: item.toString(),
        type: item === SeasonType.Movie ? "movie" : "series",
        name: SeasonTypeText[item],
        extra: [{ name: "skip" }],
      }),
    ),
  );

  return NextResponse.json(
    {
      id: pkg.name,
      name: pkg.displayName,
      description: pkg.description,
      logo: pkg.icon,
      version: pkg.version,
      resources: ["catalog", "meta", "stream"],
      types: ["movie", "series"],
      catalogs,
      idPrefixes: ["bilibili"],
    } satisfies Manifest,
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
