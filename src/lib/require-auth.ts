import { getSessionMember } from "./session";
import { NextResponse } from "next/server";

interface AuthSuccess {
  error: null;
  member: string;
}

interface AuthFailure {
  error: NextResponse;
  member: null;
}

/**
 * APIルートで認証を必須にするヘルパー。
 * 有効なセッションがない場合は401レスポンスを返す。
 *
 * @example
 * export async function GET() {
 *   const { error, member } = await requireAuth();
 *   if (error) return error;
 *   // member = userId (例: "ryo", "takagi")
 * }
 */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const member = await getSessionMember();
  if (!member) {
    return {
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
      member: null,
    };
  }
  return { error: null, member };
}
