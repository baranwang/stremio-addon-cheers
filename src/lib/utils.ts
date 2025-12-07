import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stringifyCookies = (cookies: unknown) => {
  return Object.entries(cookies as Record<string, string>)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
};

class ResourceId {
  #prefix: string;
  constructor(prefix: string) {
    this.#prefix = prefix;
  }
  parse<T>(mediaId: string): T {
    const [, data] = mediaId.split(this.#prefix);
    const searchParams = new URLSearchParams(data);
    return Object.fromEntries(searchParams.entries()) as T;
  }
  stringify<T extends Record<string, string>>(data: T): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      searchParams.set(key, value);
    }
    return `${this.#prefix}${searchParams.toString()}`;
  }
}

export const resourceId = new ResourceId("bilibili:");
