import { NextResponse } from "next/server";

import { fetchExternalLinks } from "@/lib/notion/links";

export const revalidate = 60 * 60 * 24 * 7; // 7 天

export async function GET() {
  try {
    const links = await fetchExternalLinks();
    return NextResponse.json(links);
  } catch (error) {
    console.error("links API failed", error);
    return NextResponse.json({ error: "Unable to fetch links" }, { status: 500 });
  }
}
