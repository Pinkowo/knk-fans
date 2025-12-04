import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchSongById } from "@/lib/notion/songs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 600; // 10 minutes

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
  const song = await fetchSongById(params.id, locale);

  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  return NextResponse.json(song);
}
