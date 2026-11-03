// vi.mock("…/lib/authApi.js")로 자동 모의한 authApi의 로그인 상태를 정하는 도우미.
import * as authApi from "../lib/authApi.js";

export const adminSession = { user: { id: "admin-1", email: "admin@example.com" } };

/** 앱이 시작할 때 읽을 세션을 정한다. null이면 방문자. 로그인 상태 변화를 흉내 낼 함수를 돌려준다. */
export function setMockSession(session) {
  let notify = () => {};
  authApi.getSession.mockResolvedValue(session);
  authApi.onAuthStateChange.mockImplementation(callback => {
    notify = callback;
    return () => {};
  });
  return nextSession => notify(nextSession);
}
