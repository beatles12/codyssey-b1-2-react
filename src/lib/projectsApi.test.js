import { AppError } from "./errors.js";
import { createProject, deleteProject, fetchProjectById, fetchProjects, fromRow, toRow, updateProject } from "./projectsApi.js";
import { getSupabase } from "./supabaseClient.js";

vi.mock("./supabaseClient.js", () => ({ getSupabase: vi.fn() }));

const row = {
  id: "p1",
  title: "제목",
  summary: "요약",
  description: "설명",
  category: "ai",
  tech_stack: ["React"],
  role: null,
  period: null,
  github_url: "https://github.com/x",
  demo_url: null,
  image_url: null,
  is_featured: true,
  created_at: "2026-11-01",
  updated_at: "2026-11-01",
};

/**
 * supabase.from(...).select(...).eq(...) 처럼 이어 부를 수 있고 await하면 결과를 주는 가짜 쿼리.
 * from()을 부를 때마다 results를 앞에서부터 하나씩 쓰고(마지막 결과는 계속 재사용), 첫 쿼리를 돌려준다.
 */
function mockQuery(...results) {
  const queries = [];
  const makeQuery = result => {
    const query = {};
    ["select", "order", "eq", "insert", "update", "delete", "maybeSingle", "single"].forEach(method => {
      query[method] = vi.fn(() => query);
    });
    query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
    queries.push(query);
    return query;
  };
  let index = 0;
  getSupabase.mockReturnValue({ from: vi.fn(() => makeQuery(results[Math.min(index++, results.length - 1)])) });
  return queries;
}

describe("projectsApi 변환 함수", () => {
  it("DB 행과 화면용 객체를 서로 바꾼다", () => {
    const project = fromRow(row);
    expect(project).toMatchObject({ techStack: ["React"], githubUrl: "https://github.com/x", role: "", isFeatured: true });
    expect(toRow({ ...project, role: "" })).toMatchObject({ tech_stack: ["React"], role: null, is_featured: true });
  });
});

describe("projectsApi CRUD (가짜 Supabase)", () => {
  it("목록을 최신순으로 요청해 화면용 객체로 돌려준다", async () => {
    const queries = mockQuery({ data: [row], error: null });
    const projects = await fetchProjects();
    expect(queries[0].order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(projects[0].title).toBe("제목");
  });

  it("상세 조회 결과가 없으면 notFound 오류를 던진다", async () => {
    mockQuery({ data: null, error: null });
    await expect(fetchProjectById("none")).rejects.toMatchObject({ code: "notFound" });
  });

  it("등록하면 화면이 준 id와 snake_case 행을 보내고 저장된 프로젝트를 돌려준다", async () => {
    const queries = mockQuery({ data: row, error: null });
    const created = await createProject(fromRow(row), "fixed-id");
    expect(queries[0].insert).toHaveBeenCalledWith(expect.objectContaining({ id: "fixed-id", tech_stack: ["React"] }));
    expect(created.id).toBe("p1");
  });

  it("같은 id가 이미 있으면(시간 초과된 이전 시도가 저장됨) 새로 만들지 않고 그 행을 수정한다", async () => {
    const queries = mockQuery(
      { data: null, error: { code: "23505", message: "duplicate key value violates unique constraint" } },
      { data: [{ ...row, id: "fixed-id", title: "최신 제목" }], error: null },
    );
    const saved = await createProject({ ...fromRow(row), title: "최신 제목" }, "fixed-id");

    expect(queries).toHaveLength(2);
    expect(queries[1].update).toHaveBeenCalledWith(expect.objectContaining({ title: "최신 제목" }));
    expect(queries[1].eq).toHaveBeenCalledWith("id", "fixed-id");
    expect(saved).toMatchObject({ id: "fixed-id", title: "최신 제목" });
  });

  it("id를 주지 않아도 UUID를 만들어 보낸다", async () => {
    const queries = mockQuery({ data: row, error: null });
    await createProject(fromRow(row));
    expect(queries[0].insert.mock.calls[0][0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("다른 등록 오류(RLS 등)는 수정으로 바꾸지 않고 그대로 던진다", async () => {
    const queries = mockQuery({ data: null, error: { code: "42501", message: "row-level security" } });
    await expect(createProject(fromRow(row), "fixed-id")).rejects.toMatchObject({ code: "42501" });
    expect(queries).toHaveLength(1);
  });

  it("수정·삭제가 0행인데 행이 남아 있으면(RLS 차단) notChanged 오류를 던진다", async () => {
    mockQuery({ data: [], error: null }, { data: { id: "p1" }, error: null });
    await expect(updateProject("p1", fromRow(row))).rejects.toMatchObject({ code: "notChanged" });
    mockQuery({ data: [], error: null }, { data: { id: "p1" }, error: null });
    await expect(deleteProject("p1")).rejects.toMatchObject({ code: "notChanged" });
  });

  it("수정하려는 행이 없으면 notFound 오류를 던진다", async () => {
    mockQuery({ data: [], error: null }, { data: null, error: null });
    await expect(updateProject("gone", fromRow(row))).rejects.toMatchObject({ code: "notFound" });
  });

  it("삭제가 0행이고 행도 이미 없으면(시간 초과 뒤 다시 누름) 성공으로 본다", async () => {
    mockQuery({ data: [], error: null }, { data: null, error: null });
    await expect(deleteProject("p1")).resolves.toBeUndefined();
  });

  it("삭제가 성공하면 해당 id 조건으로만 요청한다", async () => {
    const queries = mockQuery({ data: [{ id: "p1" }], error: null });
    await deleteProject("p1");
    expect(queries[0].eq).toHaveBeenCalledWith("id", "p1");
    expect(queries).toHaveLength(1);
  });

  it("Supabase 오류는 그대로 던진다", async () => {
    mockQuery({ data: null, error: { code: "42501", message: "permission denied" } });
    await expect(fetchProjects()).rejects.toMatchObject({ code: "42501" });
  });

  it("응답이 15초 넘게 없으면 timeout 오류로 끝난다 (무한 로딩 방지)", async () => {
    vi.useFakeTimers();
    const query = {};
    ["select", "order"].forEach(method => (query[method] = vi.fn(() => query)));
    query.then = () => {};
    getSupabase.mockReturnValue({ from: vi.fn(() => query) });

    const assertion = expect(fetchProjects()).rejects.toMatchObject({ code: "timeout" });
    await vi.advanceTimersByTimeAsync(15000);
    await assertion;
    vi.useRealTimers();
  });

  it("Supabase 설정이 없으면 config 오류가 전달된다", async () => {
    getSupabase.mockImplementation(() => {
      throw new AppError("config");
    });
    await expect(fetchProjects()).rejects.toMatchObject({ code: "config" });
  });
});
