import { assertPublicSupabaseKey, describeSupabaseKey } from "./supabaseKey.js";

/** 시험용 가짜 JWT를 만든다. (서명은 검사하지 않으므로 아무 문자열) */
const fakeJwt = payload => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.fake-signature`;

describe("describeSupabaseKey", () => {
  it.each([
    ["sb_publishable_abc123", "publishable"],
    ["sb_secret_abc123", "secret"],
    [fakeJwt({ role: "anon" }), "anon"],
    [fakeJwt({ role: "service_role" }), "service_role"],
    ["eyJ.not-a-jwt.x", "unknown"],
    ["hello", "unknown"],
    ["", "missing"],
    ["  sb_publishable_abc  ", "publishable"],
  ])("%s → %s", (key, kind) => {
    expect(describeSupabaseKey(key)).toBe(kind);
  });
});

describe("assertPublicSupabaseKey (빌드 안전장치)", () => {
  it("공개용 키·빈 값은 통과한다", () => {
    expect(assertPublicSupabaseKey("sb_publishable_abc")).toBe("publishable");
    expect(assertPublicSupabaseKey(fakeJwt({ role: "anon" }))).toBe("anon");
    expect(assertPublicSupabaseKey(undefined)).toBe("missing");
  });

  it("비밀키는 빌드를 멈추는 오류를 던진다", () => {
    expect(() => assertPublicSupabaseKey("sb_secret_abc")).toThrow("비밀키");
    expect(() => assertPublicSupabaseKey(fakeJwt({ role: "service_role" }))).toThrow("비밀키");
  });
});
