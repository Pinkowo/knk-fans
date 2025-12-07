import type { MetadataRoute } from "next";

import { locales } from "@/i18n";

const BASE_URL = "https://knkfans.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/members",
    "/discography",
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

  return staticPages;
}
