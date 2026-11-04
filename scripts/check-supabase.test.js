import { runChecks } from "./check-supabase.mjs";

const URL = "https://example-ref.supabase.co";
const KEY = "sb_publishable_FAKE";

/** Supabase REST 응답을 흉내 내는 가짜 fetch. routes: { "GET /rest/v1/projects": [status, body, headers] } */
function fakeSupabase(routes) {
  const calls = [];
  const fetch = async (input, init = {}) => {
    const url = new globalThis.URL(typeof input === "string" ? input : input.url);
    const route = `${init.method ?? "GET"} ${url.pathname}`;
    calls.push({ route, search: url.search });
    const [status, body, headers = {}] = routes[route] ?? [500, { message: "unexpected" }];
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
  };
  return { fetch, calls };
}

const denied = name => [401, { code: "42501", message: `permission denied for ${name}` }];
const safeSetup = {
  "GET /rest/v1/projects": [200, [{ id: "a" }], { "content-range": "0-0/3" }],
  "DELETE /rest/v1/projects": denied("table projects"),
  "POST /rest/v1/rpc/is_admin": denied("function is_admin"),
};
const statusOf = (results, title) => results.find(item => item.title === title)?.status;

describe("check:supabase 점검 스크립트 (가짜 응답)", () => {
  it("올바르게 설정되면 모든 항목이 통과하고, 삭제 시험은 없는 id만 대상으로 한다", async () => {
    const { fetch, calls } = fakeSupabase(safeSetup);
    const results = await runChecks({ url: URL, key: KEY, fetch });

    expect(results.every(item => item.status === "ok")).toBe(true);
    expect(results.find(item => item.title === "방문자 조회").detail).toContain("3건");
    const deleteCall = calls.find(call => call.route.startsWith("DELETE"));
    expect(deleteCall.search).toContain("id=eq.00000000-0000-0000-0000-000000000000");
    expect(calls.some(call => call.route.startsWith("POST /rest/v1/projects") || call.route.startsWith("PATCH"))).toBe(false);
  });

  it("방문자 삭제가 막히지 않으면 실패로 알린다", async () => {
    const { fetch } = fakeSupabase({ ...safeSetup, "DELETE /rest/v1/projects": [200, []] });
    const results = await runChecks({ url: URL, key: KEY, fetch });
    expect(statusOf(results, "방문자 삭제 차단")).toBe("fail");
  });

  it("테이블이 없으면 01 실행을 안내하고 멈춘다", async () => {
    const { fetch, calls } = fakeSupabase({
      "GET /rest/v1/projects": [404, { code: "PGRST205", message: "Could not find the table 'public.projects' in the schema cache" }],
    });
    const results = await runChecks({ url: URL, key: KEY, fetch });
    expect(results.at(-1)).toMatchObject({ status: "fail", detail: expect.stringContaining("01_schema.sql") });
    expect(calls).toHaveLength(1);
  });

  it("is_admin 함수가 없으면 02 실행을 안내한다", async () => {
    const { fetch } = fakeSupabase({ ...safeSetup, "POST /rest/v1/rpc/is_admin": [404, { code: "PGRST202", message: "Could not find the function" }] });
    const results = await runChecks({ url: URL, key: KEY, fetch });
    expect(results.find(item => item.title === "is_admin 함수")).toMatchObject({ status: "fail", detail: expect.stringContaining("02_policies.sql") });
  });

  it("비밀키를 넣으면 아무 요청도 보내지 않고 실패한다", async () => {
    const { fetch, calls } = fakeSupabase(safeSetup);
    const results = await runChecks({ url: URL, key: "sb_secret_FAKE", fetch });
    expect(statusOf(results, "키 종류")).toBe("fail");
    expect(calls).toHaveLength(0);
  });

  it("환경변수가 없으면 안내한다", async () => {
    const results = await runChecks({});
    expect(results).toEqual([expect.objectContaining({ status: "fail", title: "환경변수" })]);
  });
});
