import { NextResponse } from "next/server";

import { fetchGuideData } from "@/lib/notion/guide";

export const revalidate = 21600;

export async function GET() {
  try {
    const data = await fetchGuideData();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to load guide data", error);
    return NextResponse.json({ error: "Unable to fetch guide data" }, { status: 500 });
  }
}
