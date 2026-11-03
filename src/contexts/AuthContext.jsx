import { createContext, useEffect, useMemo, useState } from "react";
import { checkIsAdmin, getSession, onAuthStateChange, signInWithPassword, signOut } from "../lib/authApi.js";

export const AuthContext = createContext(null);

/**
 * 로그인 상태와 관리자 여부를 앱 전체에 제공한다.
 * isAdmin은 관리 버튼을 보여줄지 정하는 화면용 값이며, 실제 쓰기 권한은 Supabase RLS가 다시 검사한다.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [adminCheck, setAdminCheck] = useState({ userId: null, isAdmin: false });
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let isCurrent = true;

    getSession()
      .then(currentSession => {
        if (isCurrent) setSession(currentSession);
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent) setIsSessionLoading(false);
      });

    const unsubscribe = onAuthStateChange(nextSession => setSession(nextSession));
    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    let isCurrent = true;
    const save = isAdmin => {
      if (isCurrent) setAdminCheck({ userId, isAdmin });
    };

    checkIsAdmin()
      .then(save)
      .catch(() => save(false));

    return () => {
      isCurrent = false;
    };
  }, [userId]);

  const isAdmin = Boolean(userId) && adminCheck.userId === userId && adminCheck.isAdmin;
  const isLoading = isSessionLoading || (Boolean(userId) && adminCheck.userId !== userId);
  const value = useMemo(
    () => ({ user: session?.user ?? null, isAdmin, isLoading, signIn: signInWithPassword, signOut }),
    [session, isAdmin, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
