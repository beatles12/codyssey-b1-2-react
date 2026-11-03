import { getSession, onAuthStateChange, signInWithPassword } from "./authApi.js";

describe("authApi (Supabase 미설정)", () => {
  it("세션은 null, 구독은 아무 일도 하지 않는다", async () => {
    await expect(getSession()).resolves.toBeNull();
    expect(onAuthStateChange(() => {})).toBeTypeOf("function");
  });

  it("로그인을 시도하면 config 오류로 설정 방법을 안내한다", async () => {
    await expect(signInWithPassword("a@b.com", "pw")).rejects.toMatchObject({ code: "config" });
  });
});
