import type { MetadataRoute } from "next";

import { locales } from "@/i18n";
import { fetchSongIds } from "@/lib/notion/albums";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.knk-fans.com";
  const routes = [
    "",
    "/members",
    "/discography",
    "/about-me",
    "/variety",
    "/about",
    "/contact",
    "/links",
  ];

  const staticPages: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      staticPages.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" || route === "/discography" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  const songIds = await fetchSongIds();
  const songPages: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const id of songIds) {
      songPages.push({
        url: `${BASE_URL}/${locale}/discography/${id}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [...staticPages, ...songPages];
}
