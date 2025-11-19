import { NextResponse } from "next/server";

import { fetchVarietySeries } from "@/lib/notion/variety";

export const revalidate = 86400; // 24 小時

export async function GET() {
  try {
    const series = await fetchVarietySeries();
    return NextResponse.json(series);
  } catch (error) {
    console.error("variety API failed", error);
    return NextResponse.json({ error: "Unable to fetch variety data" }, { status: 500 });
  }
}
