import { NextResponse } from "next/server";

import { fetchAlbums } from "@/lib/notion/albums";

export const revalidate = 60 * 60 * 24 * 7; // 7 days

export async function GET() {
  try {
    const albums = await fetchAlbums();
    return NextResponse.json(albums);
  } catch (error) {
    console.error("discography API failed", error);
    return NextResponse.json({ error: "Unable to fetch albums" }, { status: 500 });
  }
}
