export const DEFAULT_PAGE_SIZE = 20;

export enum SeasonType {
  /** 番剧 */
  Anime = 1,
  /** 电影 */
  Movie = 2,
  /** 纪录片 */
  Documentary = 3,
  /** 国创 */
  ChineseAnime = 4,
  /** 电视剧 */
  TV = 5,
  /** 综艺 */
  VarietyShow = 7,
}

export const SeasonTypeText = {
  [SeasonType.Anime]: "番剧",
  [SeasonType.Movie]: "电影",
  [SeasonType.Documentary]: "纪录片",
  [SeasonType.ChineseAnime]: "国创",
  [SeasonType.TV]: "电视剧",
  [SeasonType.VarietyShow]: "综艺",
};
