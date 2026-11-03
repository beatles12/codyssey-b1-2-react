// 여러 곳(Supabase, fetch, 설정 누락)에서 생긴 오류를 화면용 문구 key로 바꾼다.

/** 앱에서 직접 만드는 오류. code로 종류를 구분한다. */
export class AppError extends Error {
  constructor(code, message = code) {
    super(message);
    this.code = code;
  }
}

/** 오류 객체를 i18n 문구 key("errors.xxx")로 바꾼다. */
export function toErrorKey(error) {
  const code = error?.code;
  const status = error?.status;
  const message = String(error?.message ?? "");

  if (code === "config") return "errors.config";
  if (code === "notFound" || code === "PGRST116" || code === "22P02") return "errors.notFound";
  if (code === "permission" || code === "42501" || status === 401 || status === 403) return "errors.permission";
  if (code === "invalid_credentials" || message.includes("Invalid login credentials")) return "errors.invalidLogin";
  if (/failed to fetch|networkerror|load failed/i.test(message)) return "errors.network";
  return "errors.unknown";
}
