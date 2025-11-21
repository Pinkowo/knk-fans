import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchAlbums } from "@/lib/notion/albums";

export const revalidate = 604800; // 7 days

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
    const albums = await fetchAlbums(locale);
    return NextResponse.json(albums);
  } catch (error) {
    console.error("discography API failed", error);
    return NextResponse.json({ error: "Unable to fetch albums" }, { status: 500 });
  }
}
