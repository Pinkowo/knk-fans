import { NextResponse } from "next/server";

import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { fetchMemberById } from "@/lib/notion/members";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 86400; // 24 小時

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = locales.includes(localeParam as AppLocale) ? (localeParam as AppLocale) : defaultLocale;
  const member = await fetchMemberById(params.id, locale);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}
