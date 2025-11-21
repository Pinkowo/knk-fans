import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchGuideData } from "@/lib/notion/guide";

export const revalidate = 21600;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
    const data = await fetchGuideData(locale);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to load guide data", error);
    return NextResponse.json({ error: "Unable to fetch guide data" }, { status: 500 });
  }
}
