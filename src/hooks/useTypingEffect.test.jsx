import { act, renderHook } from "@testing-library/react";
import useTypingEffect, { getTypingDelay } from "./useTypingEffect.js";

describe("useTypingEffect", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("활성화되면 시작 지연 뒤 한 글자씩 늘어난다", () => {
    const { result } = renderHook(() => useTypingEffect("안녕", true, 500));
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe("안");

    act(() => vi.advanceTimersByTime(110));
    expect(result.current).toBe("안녕");
  });

  it("비활성 상태에서는 시작하지 않는다", () => {
    const { result } = renderHook(() => useTypingEffect("안녕", false));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe("");
  });

  it("문구가 바뀌면(언어 전환) 전체 문구를 바로 보여준다", () => {
    const { result, rerender } = renderHook(({ text }) => useTypingEffect(text, true), {
      initialProps: { text: "안녕하세요" },
    });

    rerender({ text: "Hello" });

    expect(result.current).toBe("Hello");
  });

  it("문장 부호 뒤에는 더 오래 쉰다", () => {
    expect(getTypingDelay(".")).toBeGreaterThan(getTypingDelay(","));
    expect(getTypingDelay(",")).toBeGreaterThan(getTypingDelay("가"));
  });
});
