import { createClient } from "@supabase/supabase-js";
import { AppError } from "./errors.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** .env에 Supabase 주소와 공개(anon) 키가 모두 들어 있는지. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const client = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!client && import.meta.env.DEV) {
  console.warn("[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY가 없습니다. .env.example을 참고해 .env를 만들어 주세요.");
}

/** Supabase 클라이언트를 돌려준다. 설정이 없으면 "config" 오류를 던져 화면에 설정 방법을 안내한다. */
export function getSupabase() {
  if (!client) throw new AppError("config");
  return client;
}
