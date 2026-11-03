import { AppError, toErrorKey } from "./errors.js";

describe("toErrorKey", () => {
  it.each([
    [new AppError("config"), "errors.config"],
    [new AppError("notFound"), "errors.notFound"],
    [{ code: "22P02" }, "errors.notFound"],
    [new AppError("notChanged"), "errors.notChanged"],
    [{ code: "42501" }, "errors.permission"],
    [{ status: 401 }, "errors.permission"],
    [{ message: "Invalid login credentials" }, "errors.invalidLogin"],
    [new TypeError("Failed to fetch"), "errors.network"],
    [new Error("???"), "errors.unknown"],
  ])("%o → %s", (error, key) => {
    expect(toErrorKey(error)).toBe(key);
  });
});
