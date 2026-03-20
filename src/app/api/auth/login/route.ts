import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookie } from "@/lib/session";

function getPassword(memberId: string): string | undefined {
  if (memberId === "takagi") return process.env.PORTAL_PASSWORD_OWNER;
  if (memberId === "ryo") return process.env.PORTAL_PASSWORD_PM;
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { memberId, password } = await req.json();

    if (
      typeof memberId !== "string" ||
      typeof password !== "string" ||
      !memberId ||
      !password
    ) {
      return NextResponse.json(
        { error: "メンバーIDとパスワードが必要です" },
        { status: 400 }
      );
    }

    const expected = getPassword(memberId);
    if (!expected || password !== expected) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(memberId);
    const res = NextResponse.json({ userId: memberId });
    res.headers.set("Set-Cookie", getSessionCookie(token));
    return res;
  } catch {
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    );
  }
}
