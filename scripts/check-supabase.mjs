// 실제 Supabase 연결을 "조회와 차단 확인"만으로 점검한다. 데이터를 만들거나 바꾸지 않는다.
// 사용: npm run check:supabase   (.env 의 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 읽음)
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";
import { describeSupabaseKey } from "./supabaseKey.js";

// 앱의 createProjectId(UUID v4)와 DB 기본값(gen_random_uuid)은 이 값을 만들지 않으므로 어떤 행과도 맞지 않는다.
const NO_SUCH_ID = "00000000-0000-0000-0000-000000000000";
const URL_PATTERN = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/;

/** 조회 오류를 사람이 읽을 안내로 바꾼다. */
function explainReadError(error) {
  const text = `${error.code ?? ""} ${error.message ?? ""}`;
  if (/PGRST205|42P01/.test(text)) return "projects 테이블이 없습니다 → supabase/01_schema.sql 을 실행하세요.";
  if (/Invalid API key|No API key|401/i.test(text)) return "키가 올바르지 않습니다 → 같은 프로젝트의 Publishable(anon) 키인지 확인하세요.";
  if (/fetch failed|ENOTFOUND|network/i.test(text)) return "주소에 연결할 수 없습니다 → VITE_SUPABASE_URL 과 인터넷 연결을 확인하세요.";
  return `조회 실패: ${error.message || error.code}`;
}

/**
 * 점검을 실행하고 결과 목록을 돌려준다. 각 항목: { status: "ok" | "warn" | "fail", title, detail }
 * @param {{ url?: string, key?: string, fetch?: typeof fetch }} options fetch는 테스트에서 가짜로 바꿀 때만 사용
 */
export async function runChecks({ url = "", key = "", fetch: customFetch } = {}) {
  const results = [];
  const add = (status, title, detail) => results.push({ status, title, detail });

  if (!url || !key) {
    add("fail", "환경변수", ".env 에 VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 를 넣어 주세요.");
    return results;
  }
  add(URL_PATTERN.test(url) ? "ok" : "warn", "주소 형식", URL_PATTERN.test(url) ? "https://….supabase.co" : `${url} — 보통 https://<프로젝트ID>.supabase.co 형식입니다.`);

  const kind = describeSupabaseKey(key);
  if (kind === "secret" || kind === "service_role") {
    add("fail", "키 종류", "비밀키입니다. 브라우저용 환경변수에 절대 넣지 마세요. Publishable key 로 바꾸고, 노출됐다면 Supabase에서 그 비밀키를 폐기하세요.");
    return results;
  }
  const keyText = { publishable: "Publishable key (권장)", anon: "예전 형식 anon 키 (사용 가능)" }[kind];
  add(keyText ? "ok" : "warn", "키 종류", keyText ?? "형식을 알 수 없는 키입니다. Supabase의 Publishable key 를 복사했는지 확인하세요.");

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(customFetch ? { global: { fetch: customFetch } } : {}),
  });

  const read = await client.from("projects").select("id", { count: "exact" }).limit(1);
  if (read.error) {
    add("fail", "방문자 조회", explainReadError(read.error));
    return results;
  }
  add("ok", "방문자 조회", `projects 테이블 연결 성공 · 현재 ${read.count ?? read.data.length}건`);

  const removal = await client.from("projects").delete().eq("id", NO_SUCH_ID).select("id");
  if (removal.error?.code === "42501") add("ok", "방문자 삭제 차단", "permission denied — 02_policies.sql 의 권한 설정이 적용되어 있습니다.");
  else if (removal.error) add("warn", "방문자 삭제 차단", `예상과 다른 응답입니다: ${removal.error.message}`);
  else add("fail", "방문자 삭제 차단", "방문자에게 삭제 권한이 열려 있습니다 → 02_policies.sql 을 다시 실행하세요. (없는 id로 시험해 데이터는 바뀌지 않았습니다)");

  const adminCheck = await client.rpc("is_admin");
  if (adminCheck.error?.code === "42501") add("ok", "is_admin 함수", "방문자는 호출할 수 없음 — 02_policies.sql 이 적용되어 있습니다.");
  else if (adminCheck.error?.code === "PGRST202") add("fail", "is_admin 함수", "함수가 없습니다 → 02_policies.sql 을 실행하세요.");
  else if (adminCheck.error) add("warn", "is_admin 함수", `예상과 다른 응답입니다: ${adminCheck.error.message}`);
  else if (adminCheck.data === true) add("fail", "is_admin 함수", "방문자가 관리자로 판정됩니다 → 02_policies.sql 과 admin_users 를 확인하세요.");
  else add("warn", "is_admin 함수", "방문자도 호출할 수 있습니다(결과는 false). 02_policies.sql 을 다시 실행하면 정리됩니다.");

  return results;
}

/** 명령줄에서 실행할 때: .env 를 읽어 점검하고 결과를 출력한다. 실패가 있으면 종료 코드 1. */
async function main() {
  const env = loadEnv("production", process.cwd(), "VITE_");
  console.log("B1-2 Supabase 연결 점검 — 데이터를 만들거나 바꾸지 않습니다.\n");
  const results = await runChecks({ url: env.VITE_SUPABASE_URL, key: env.VITE_SUPABASE_ANON_KEY });
  const icon = { ok: "✅", warn: "⚠️ ", fail: "❌" };
  results.forEach(item => console.log(`${icon[item.status]} ${item.title}: ${item.detail}`));
  const count = status => results.filter(item => item.status === status).length;
  console.log(`\n결과: 통과 ${count("ok")} · 주의 ${count("warn")} · 실패 ${count("fail")}`);
  console.log("다음: Supabase SQL Editor 에서 supabase/05_verify_rls.sql 실행, 회원가입 OFF 는 대시보드에서 직접 확인");
  process.exitCode = count("fail") > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
