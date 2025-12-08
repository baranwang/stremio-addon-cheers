import type { Manifest, ManifestCatalog } from "@stremio-addon/sdk";
import { NextResponse } from "next/server";
import pkg from "@/../package.json" with { type: "json" };
import { getSeasonCondition, SeasonType } from "@/lib/bilibili";

const baseCatalogs: ManifestCatalog[] = [
  { id: SeasonType.Anime.toString(), type: "series", name: "番剧" },
  { id: SeasonType.Movie.toString(), type: "movie", name: "电影" },
  { id: SeasonType.Documentary.toString(), type: "series", name: "纪录片" },
  { id: SeasonType.ChineseAnime.toString(), type: "series", name: "国创" },
  { id: SeasonType.TV.toString(), type: "series", name: "电视剧" },
  { id: SeasonType.VarietyShow.toString(), type: "series", name: "综艺" },
];

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
  const catalogs = await Promise.all(baseCatalogs.map(buildCatalog));

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
      behaviorHints: {
        configurable: true,
        configurationRequired: true,
      },
    } satisfies Manifest,
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
