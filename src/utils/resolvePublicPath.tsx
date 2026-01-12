import type { PageRow, PostRow } from "../types/contentTypes";

type AnyPage = PageRow | PostRow;

export function resolvePublicPath(page: AnyPage): string {
  if (page.type === "home") {
    return "/";
  }

  return `/pages/${page.slug}`;
}