import { NextResponse } from "next/server";

import { fetchGroupInfo } from "@/lib/notion/about";

export const revalidate = 604800;

export async function GET() {
  try {
    const info = await fetchGroupInfo();
    return NextResponse.json(info);
  } catch (error) {
    console.error("about API failed", error);
    return NextResponse.json({ error: "Unable to fetch group info" }, { status: 500 });
  }
}
