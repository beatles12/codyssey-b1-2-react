import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { resetBrowserMocks } from "./browserMocks.js";

beforeEach(() => {
  globalThis.fetch = vi.fn(() => Promise.reject(new Error("테스트에서는 실제 네트워크 요청을 막습니다.")));
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  resetBrowserMocks();
  delete document.documentElement.dataset.theme;
});
