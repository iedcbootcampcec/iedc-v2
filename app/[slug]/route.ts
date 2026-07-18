import { NextResponse } from "next/server";
import { getRedirectFromSlug } from "./services/redirect";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const redirectData = await getRedirectFromSlug(slug);
    if (!redirectData?.redirect) {
      return NextResponse.redirect(new URL("/404", req.url), { status: 307 });
    }
    return NextResponse.redirect(redirectData.redirect, {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=21600", // 6 hours
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/404", req.url), { status: 307 });
  }
}
