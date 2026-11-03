import { withTimeout } from "./request.js";
import { toErrorKey } from "./errors.js";
import { toSafeImageUrl, toSafeLinkUrl } from "./validators.js";

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
