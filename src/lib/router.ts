import { match } from "path-to-regexp";

const parseExtra = (value: string | undefined) => {
  if (!value) return {};
  return Object.fromEntries(new URLSearchParams(value));
};

export const matchResourceRoute = (url: URL) => {
  const matcher = match<{
    resource: string;
    type: string;
    id: string;
    extra?: string;
  }>("/:resource/:type/:id{/:extra}.json");
  const matches = matcher(url.pathname);
  if (matches) {
    const { extra, ...params } = matches.params;
    let extraParams: Record<string, string> = {};
    if (extra) {
      extraParams = parseExtra(extra);
    }
    if (url.search) {
      extraParams = { ...extraParams, ...Object.fromEntries(url.searchParams) };
    }
    return [true, { ...params, extra: extraParams }] as const;
  }
  return [false, null] as const;
};
