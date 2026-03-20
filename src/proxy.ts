import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Protect all other API routes
  if (pathname.startsWith("/api/")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = await verifySessionToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: "セッションが無効です。再ログインしてください" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
