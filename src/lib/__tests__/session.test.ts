import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// next/headers の cookies() はNode環境で動かないためモックする
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// next/server の NextResponse をモック (require-auth.test.ts と共用)
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: ResponseInit) => ({ body, status: init?.status ?? 200 })),
  },
}));

describe("session (torisawa-portal)", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.resetModules();
  });

  // ------------------------------------------------------------------
  // createSessionToken
  // ------------------------------------------------------------------
  describe("createSessionToken", () => {
    it("PORTAL_SESSION_SECRETが未設定のときthrowする", async () => {
      delete process.env.PORTAL_SESSION_SECRET;
      const { createSessionToken } = await import("../session");
      await expect(createSessionToken("ryo")).rejects.toThrow(
        "PORTAL_SESSION_SECRET is not set"
      );
    });

    it("トークンはuserid.timestamp.sigの3パート構造", async () => {
      vi.stubEnv("PORTAL_SESSION_SECRET", "testsecret");
      const { createSessionToken } = await import("../session");
      const token = await createSessionToken("ryo");
      expect(token.split(".")).toHaveLength(3);
      expect(token.startsWith("ryo.")).toBe(true);
    });
  });

  // ------------------------------------------------------------------
  // verifySessionToken
  // ------------------------------------------------------------------
  describe("verifySessionToken", () => {
    it("正しいトークンでuserIdを返す", async () => {
      vi.stubEnv("PORTAL_SESSION_SECRET", "testsecret");
      const { createSessionToken, verifySessionToken } = await import("../session");
      const token = await createSessionToken("ryo");
      const result = await verifySessionToken(token);
      expect(result).toBe("ryo");
    });

    it("署名を改ざんしたトークンでnullを返す", async () => {
      vi.stubEnv("PORTAL_SESSION_SECRET", "testsecret");
      const { createSessionToken, verifySessionToken } = await import("../session");
      const token = await createSessionToken("ryo");
      // 末尾数文字を書き換える
      const tampered = token.slice(0, -4) + "ffff";
      const result = await verifySessionToken(tampered);
      expect(result).toBeNull();
    });

    it("パートが3つでないトークンでnullを返す", async () => {
      vi.stubEnv("PORTAL_SESSION_SECRET", "testsecret");
      const { verifySessionToken } = await import("../session");
      expect(await verifySessionToken("onlyone")).toBeNull();
      expect(await verifySessionToken("two.parts")).toBeNull();
      expect(await verifySessionToken("four.parts.with.extra")).toBeNull();
    });

    it("タイムスタンプが7日を超えた期限切れトークンでnullを返す", async () => {
      vi.stubEnv("PORTAL_SESSION_SECRET", "testsecret");
      const { verifySessionToken } = await import("../session");

      // 8日前のタイムスタンプで手動トークンを構築
      const secret = "testsecret";
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const oldTs = (Date.now() - 8 * 24 * 60 * 60 * 1000).toString();
      const data = `ryo.${oldTs}`;
      const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
      const sig = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expiredToken = `ryo.${oldTs}.${sig}`;

      const result = await verifySessionToken(expiredToken);
      expect(result).toBeNull();
    });

    it("PORTAL_SESSION_SECRETが未設定のときnullを返す", async () => {
      delete process.env.PORTAL_SESSION_SECRET;
      const { verifySessionToken } = await import("../session");
      const result = await verifySessionToken("ryo.123456789.fakesig");
      expect(result).toBeNull();
    });

    it("タイミング攻撃対策: 長さが違う署名でnullを返す", async () => {
      vi.stubEnv("PORTAL_SESSION_SECRET", "testsecret");
      const { createSessionToken, verifySessionToken } = await import("../session");
      const token = await createSessionToken("ryo");
      const parts = token.split(".");
      // 署名部分を極端に短くする
      const shortSigToken = `${parts[0]}.${parts[1]}.ab`;
      const result = await verifySessionToken(shortSigToken);
      expect(result).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // getSessionCookie / clearSessionCookie
  // ------------------------------------------------------------------
  describe("getSessionCookie", () => {
    it("Set-Cookie文字列を返す", async () => {
      const { getSessionCookie } = await import("../session");
      const header = getSessionCookie("testtoken");
      expect(header).toContain("torisawa-session=testtoken");
      expect(header).toContain("HttpOnly");
      expect(header).toContain("Secure");
    });
  });

  describe("clearSessionCookie", () => {
    it("Max-Age=0 を含むSet-Cookie文字列を返す", async () => {
      const { clearSessionCookie } = await import("../session");
      const header = clearSessionCookie();
      expect(header).toContain("Max-Age=0");
      expect(header).toContain("torisawa-session=");
    });
  });
});
