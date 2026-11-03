import { createContext, useEffect, useMemo, useState } from "react";
import { getSession, onAuthStateChange, signInWithPassword, signOut } from "../lib/authApi.js";

export const AuthContext = createContext(null);

/**
 * 로그인 상태를 앱 전체에 제공한다.
 * 화면은 로그인한 사람에게만 관리 버튼을 보여줄 뿐이고, 실제 쓰기 권한은 Supabase RLS가 판단한다.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    getSession()
      .then(currentSession => {
        if (isCurrent) setSession(currentSession);
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    const unsubscribe = onAuthStateChange(nextSession => setSession(nextSession));
    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isLoading, signIn: signInWithPassword, signOut }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
