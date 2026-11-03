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

/** supabase.from(...).select(...).eq(...) 처럼 이어 부를 수 있고 await하면 result를 주는 가짜 쿼리. */
function mockQuery(result) {
  const query = {};
  ["select", "order", "eq", "insert", "update", "delete", "maybeSingle", "single"].forEach(method => {
    query[method] = vi.fn(() => query);
  });
  query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  getSupabase.mockReturnValue({ from: vi.fn(() => query) });
  return query;
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
    const query = mockQuery({ data: [row], error: null });
    const projects = await fetchProjects();
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(projects[0].title).toBe("제목");
  });

  it("상세 조회 결과가 없으면 notFound 오류를 던진다", async () => {
    mockQuery({ data: null, error: null });
    await expect(fetchProjectById("none")).rejects.toMatchObject({ code: "notFound" });
  });

  it("등록하면 snake_case 행을 보내고 저장된 프로젝트를 돌려준다", async () => {
    const query = mockQuery({ data: row, error: null });
    const created = await createProject(fromRow(row));
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({ tech_stack: ["React"] }));
    expect(created.id).toBe("p1");
  });

  it("수정·삭제된 행이 0개면(RLS 차단) notChanged 오류를 던진다", async () => {
    mockQuery({ data: [], error: null });
    await expect(updateProject("p1", fromRow(row))).rejects.toMatchObject({ code: "notChanged" });
    await expect(deleteProject("p1")).rejects.toMatchObject({ code: "notChanged" });
  });

  it("삭제가 성공하면 해당 id 조건으로 요청한다", async () => {
    const query = mockQuery({ data: [{ id: "p1" }], error: null });
    await deleteProject("p1");
    expect(query.eq).toHaveBeenCalledWith("id", "p1");
  });

  it("Supabase 오류는 그대로 던진다", async () => {
    mockQuery({ data: null, error: { code: "42501", message: "permission denied" } });
    await expect(fetchProjects()).rejects.toMatchObject({ code: "42501" });
  });

  it("Supabase 설정이 없으면 config 오류가 전달된다", async () => {
    getSupabase.mockImplementation(() => {
      throw new AppError("config");
    });
    await expect(fetchProjects()).rejects.toMatchObject({ code: "config" });
  });
});
