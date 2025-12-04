import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchExternalLinks } from "@/lib/notion/links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 604800; // 7 天

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
    const links = await fetchExternalLinks(locale);
    return NextResponse.json(links);
  } catch (error) {
    console.error("links API failed", error);
    return NextResponse.json({ error: "Unable to fetch links" }, { status: 500 });
  }
}
