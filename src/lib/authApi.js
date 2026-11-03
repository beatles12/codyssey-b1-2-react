// Supabase Auth(로그인) 호출을 감싼 함수. Supabase 설정이 없으면 "로그인 안 됨" 상태로 동작한다.
import { getSupabase, isSupabaseConfigured } from "./supabaseClient.js";

/** 저장된 로그인 세션을 가져온다. 없으면 null. */
export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

/** 로그인·로그아웃이 일어날 때마다 callback(session)을 부른다. 구독 해제 함수를 돌려준다. */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

/** 이메일·비밀번호로 로그인한다. 실패하면 오류를 던진다. */
export async function signInWithPassword(email, password) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return data.session;
}

/** 로그아웃한다. */
export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}
