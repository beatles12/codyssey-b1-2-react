import { withTimeout } from "./request.js";
import { toErrorKey } from "./errors.js";
import { createProjectId } from "./id.js";
import { isOptionalImageUrl, toSafeImageUrl, toSafeLinkUrl } from "./validators.js";

describe("withTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("제한 시간 안에 끝나면 결과를 그대로 돌려준다", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 1000)).resolves.toBe("ok");
  });

  it("응답이 없으면 제한 시간 뒤 timeout 오류로 끝나고 안내 문구로 바뀐다", async () => {
    const pending = withTimeout(new Promise(() => {}), 1000);
    const assertion = expect(pending).rejects.toMatchObject({ code: "timeout" });
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
    expect(toErrorKey({ code: "timeout" })).toBe("errors.timeout");
  });
});

describe("안전한 주소만 통과", () => {
  it.each([
    ["https://github.com/x", "https://github.com/x"],
    ["javascript:alert(1)", ""],
    ["/images/a.png", ""],
    ["", ""],
  ])("링크 %s → %s", (input, expected) => {
    expect(toSafeLinkUrl(input)).toBe(expected);
  });

  it.each([
    ["https://cdn.example.com/a.png", "https://cdn.example.com/a.png"],
    ["/images/a.png", "/images/a.png"],
    ["javascript:alert(1)", ""],
    ["data:text/html,<script>", ""],
  ])("이미지 %s → %s", (input, expected) => {
    expect(toSafeImageUrl(input)).toBe(expected);
  });
});

describe("이미지 주소 규칙 (supabase/01_schema.sql 의 image_url CHECK 와 같은 결과)", () => {
  it.each([
    ["/images/budget.png", true],
    ["/images/sub/a-b_c.v2.png", true],
    ["https://cdn.example.com/a.png", true],
    ["HTTPS://EXAMPLE.COM/A.PNG", true],
    ["//example.com/a.png", false],
    ["//evil.com", false],
    ["/\\evil.com/a.png", false],
    ["/images/a b.png", false],
    ["/", false],
    ["images/a.png", false],
    ["javascript:alert(1)", false],
    ["data:image/png;base64,xx", false],
    ["https://", false],
    ["/images/a.png?v=2", false],
    ["ftp://example.com/a.png", false],
  ])("%s → %s", (input, expected) => {
    expect(isOptionalImageUrl(input)).toBe(expected);
  });

  it("프로토콜 상대 경로는 화면에도 이미지로 쓰지 않는다", () => {
    expect(toSafeImageUrl("//example.com/a.png")).toBe("");
  });
});

describe("createProjectId", () => {
  it("UUID v4 형식이고 매번 다르다", () => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(createProjectId()).toMatch(uuid);
    expect(createProjectId()).not.toBe(createProjectId());
  });

  it("randomUUID가 없는 환경(https가 아닌 주소)에서도 UUID v4를 만든다", () => {
    const original = crypto.randomUUID;
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
    try {
      expect(createProjectId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    } finally {
      Object.defineProperty(crypto, "randomUUID", { value: original, configurable: true });
    }
  });
});
