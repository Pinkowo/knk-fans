import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchVarietyCards } from "@/lib/notion/variety";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 86400; // 24 小時

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
    const cards = await fetchVarietyCards(locale);
    return NextResponse.json(cards);
  } catch (error) {
    console.error("variety API failed", error);
    return NextResponse.json({ error: "Unable to fetch variety data" }, { status: 500 });
  }
}
