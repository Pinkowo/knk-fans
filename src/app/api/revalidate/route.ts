import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

interface RevalidatePayload {
  secret?: string;
  path?: string | string[];
  tag?: string | string[];
}

function ensureArray(input?: string | string[]) {
  if (!input) {
    return [];
  }

  return Array.isArray(input) ? input : [input];
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidation secret is not configured" }, { status: 500 });
  }

  let payload: RevalidatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload.secret || payload.secret !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const paths = ensureArray(payload.path);
  const tags = ensureArray(payload.tag);

  if (paths.length === 0 && tags.length === 0) {
    return NextResponse.json({ error: "Provide at least one path or tag" }, { status: 400 });
  }

  paths.forEach((path) => {
    if (path.startsWith("/")) {
      revalidatePath(path);
    } else {
      revalidatePath(`/${path}`);
    }
  });

  tags.forEach((tag) => {
    revalidateTag(tag, "manual");
  });

  return NextResponse.json({
    revalidated: true,
    paths,
    tags,
    timestamp: Date.now(),
  });
}
