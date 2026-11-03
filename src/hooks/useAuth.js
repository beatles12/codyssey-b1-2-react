import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";

/** 로그인 정보({ user, isLoading, signIn, signOut })를 꺼내 쓴다. user가 null이면 방문자. */
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  return context;
}

export default useAuth;
