import { getSupabase, isSupabaseConfigured } from "./supabaseClient.js";

describe("supabaseClient (환경변수 없음)", () => {
  it("테스트 환경에는 .env가 없으므로 미설정 상태이고 config 오류를 던진다", () => {
    expect(isSupabaseConfigured).toBe(false);
    expect(() => getSupabase()).toThrow(expect.objectContaining({ code: "config" }));
  });
});
