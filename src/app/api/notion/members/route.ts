import { NextResponse } from "next/server";

import { fetchMembers } from "@/lib/notion/members";

export const revalidate = 60 * 60 * 24; // 24 小時

export async function GET() {
  try {
    const members = await fetchMembers();
    const current = members.filter((member) => member.status === "current");
    const former = members.filter((member) => member.status === "former");

    return NextResponse.json({ current, former });
  } catch (error) {
    console.error("members API failed", error);
    return NextResponse.json({ error: "Unable to fetch members" }, { status: 500 });
  }
}
