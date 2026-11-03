import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { resetBrowserMocks } from "./browserMocks.js";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  resetBrowserMocks();
  delete document.documentElement.dataset.theme;
});
