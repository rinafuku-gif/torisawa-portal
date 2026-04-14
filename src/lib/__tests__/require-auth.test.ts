import { describe, it, expect, vi, beforeEach } from "vitest";

// next/server をモック
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: ResponseInit) => ({
      _type: "NextResponse",
      body,
      status: init?.status ?? 200,
    })),
  },
}));

// session のgetSessionMemberをモックして認証状態を制御
vi.mock("../session", () => ({
  getSessionMember: vi.fn(),
  COOKIE_NAME: "torisawa-session",
}));

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効なセッションがあれば { error: null, member: userId } を返す", async () => {
    const { getSessionMember } = await import("../session");
    vi.mocked(getSessionMember).mockResolvedValue("ryo");

    const { requireAuth } = await import("../require-auth");
    const result = await requireAuth();

    expect(result.error).toBeNull();
    expect(result.member).toBe("ryo");
  });

  it("セッションがなければ 401 NextResponse を返す", async () => {
    const { getSessionMember } = await import("../session");
    vi.mocked(getSessionMember).mockResolvedValue(null);

    const { requireAuth } = await import("../require-auth");
    const result = await requireAuth();

    expect(result.member).toBeNull();
    // error は NextResponse (status 401)
    expect(result.error).not.toBeNull();
    const errorResponse = result.error as { status: number; body: unknown };
    expect(errorResponse.status).toBe(401);
  });
});
