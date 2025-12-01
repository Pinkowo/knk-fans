import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchGroupInfo } from "@/lib/notion/about";

export const dynamic = "force-dynamic";
export const revalidate = 604800;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
    const info = await fetchGroupInfo(locale);
    return NextResponse.json(info);
  } catch (error) {
    console.error("about API failed", error);
    return NextResponse.json({ error: "Unable to fetch group info" }, { status: 500 });
  }
}
