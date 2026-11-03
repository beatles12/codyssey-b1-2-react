import { AppError } from "./errors.js";

export const REQUEST_TIMEOUT_MS = 15000;

/** promise가 ms 안에 끝나지 않으면 "timeout" 오류로 끝낸다. 무한 로딩을 막기 위함이며 요청 자체를 취소하지는 않는다. */
export function withTimeout(promise, ms = REQUEST_TIMEOUT_MS) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new AppError("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}
