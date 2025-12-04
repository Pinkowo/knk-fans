import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchVarietySeries } from "@/lib/notion/variety";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 86400; // 24 小時

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
    const series = await fetchVarietySeries(locale);
    return NextResponse.json(series);
  } catch (error) {
    console.error("variety API failed", error);
    return NextResponse.json({ error: "Unable to fetch variety data" }, { status: 500 });
  }
}
