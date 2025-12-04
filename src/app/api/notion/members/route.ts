import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchMembers } from "@/lib/notion/members";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 86400; // 24 小時

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
    const members = await fetchMembers(locale);
    const current = members.filter((member) => member.status === "current");
    const former = members.filter((member) => member.status === "former");

    return NextResponse.json({ current, former });
  } catch (error) {
    console.error("members API failed", error);
    return NextResponse.json({ error: "Unable to fetch members" }, { status: 500 });
  }
}
