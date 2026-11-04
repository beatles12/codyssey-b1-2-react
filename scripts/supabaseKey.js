// Supabase 키의 종류를 알아내고, 브라우저에 공개되면 안 되는 비밀키를 막는 도우미. (Node 전용: 빌드·점검 스크립트에서 사용)

/** 키 종류: "publishable" | "anon"(예전 JWT) | "secret" | "service_role" | "unknown" | "missing" */
export function describeSupabaseKey(key = "") {
  const value = key.trim();
  if (!value) return "missing";
  if (value.startsWith("sb_publishable_")) return "publishable";
  if (value.startsWith("sb_secret_")) return "secret";

  const parts = value.split(".");
  if (parts.length !== 3 || !value.startsWith("eyJ")) return "unknown";
  try {
    const { role } = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (role === "service_role") return "service_role";
    if (role === "anon") return "anon";
  } catch {
    // JWT 모양이지만 읽을 수 없으면 알 수 없는 키로 본다.
  }
  return "unknown";
}

/** 비밀키(secret·service_role)면 오류를 던진다. Vite는 VITE_ 값을 빌드 결과에 그대로 넣기 때문이다. */
export function assertPublicSupabaseKey(key) {
  const kind = describeSupabaseKey(key);
  if (kind === "secret" || kind === "service_role") {
    throw new Error(
      "[보안] VITE_SUPABASE_ANON_KEY에 비밀키(secret/service_role)가 들어 있습니다. 빌드하면 누구나 볼 수 있으므로 중단합니다. " +
        "Supabase의 Publishable key(sb_publishable_…) 또는 anon 키로 바꾸세요.",
    );
  }
  return kind;
}
