import { NextResponse } from "next/server";

import { fetchMemberById } from "@/lib/notion/members";

export const revalidate = 60 * 60 * 24; // 24 小時

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const member = await fetchMemberById(params.id);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}
