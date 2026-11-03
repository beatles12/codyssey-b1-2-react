// vi.mock("…/lib/authApi.js")로 자동 모의한 authApi의 로그인 상태를 정하는 도우미.
import * as authApi from "../lib/authApi.js";

export const adminSession = { user: { id: "admin-1", email: "admin@example.com" } };
export const memberSession = { user: { id: "member-1", email: "member@example.com" } };

/**
 * 앱이 시작할 때 읽을 세션과 관리자 여부(is_admin 결과)를 정한다. session이 null이면 방문자.
 * 로그인 상태 변화를 흉내 낼 함수를 돌려준다.
 */
export function setMockSession(session, { isAdmin = session === adminSession } = {}) {
  let notify = () => {};
  authApi.getSession.mockResolvedValue(session);
  authApi.checkIsAdmin.mockImplementation(async () => isAdmin);
  authApi.onAuthStateChange.mockImplementation(callback => {
    notify = callback;
    return () => {};
  });
  return nextSession => notify(nextSession);
}
