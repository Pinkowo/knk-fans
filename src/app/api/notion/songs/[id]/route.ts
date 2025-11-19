import { NextResponse } from "next/server";

import { fetchSongById } from "@/lib/notion/songs";

export const revalidate = 600; // 10 minutes

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const song = await fetchSongById(params.id);

  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  return NextResponse.json(song);
}
