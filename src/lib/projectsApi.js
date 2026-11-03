// Supabase projects 테이블의 CRUD 함수. 화면 코드는 이 파일만 부르고 Supabase를 직접 다루지 않는다.
import { AppError } from "./errors.js";
import { withTimeout } from "./request.js";
import { getSupabase } from "./supabaseClient.js";

const TABLE = "projects";
const COLUMNS =
  "id, title, summary, description, category, tech_stack, role, period, github_url, demo_url, image_url, is_featured, created_at, updated_at";

/** DB 한 행(snake_case)을 화면용 객체(camelCase)로 바꾼다. */
export function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.category,
    techStack: row.tech_stack ?? [],
    role: row.role ?? "",
    period: row.period ?? "",
    githubUrl: row.github_url ?? "",
    demoUrl: row.demo_url ?? "",
    imageUrl: row.image_url ?? "",
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 화면용 객체를 DB에 저장할 행으로 바꾼다. 빈 문자열은 null로 저장한다. */
export function toRow(project) {
  return {
    title: project.title,
    summary: project.summary,
    description: project.description,
    category: project.category,
    tech_stack: project.techStack,
    role: project.role || null,
    period: project.period || null,
    github_url: project.githubUrl || null,
    demo_url: project.demoUrl || null,
    image_url: project.imageUrl || null,
    is_featured: project.isFeatured,
  };
}

/** 쿼리를 시간 제한과 함께 실행하고, 오류가 있으면 던지고 없으면 data를 돌려준다. */
async function run(query) {
  const { data, error } = await withTimeout(query);
  if (error) throw error;
  return data;
}

/** 수정·삭제된 행이 0개면 권한이 없거나(RLS) 이미 삭제된 것이므로 오류를 던진다. */
function ensureChanged(rows) {
  if (!rows || rows.length === 0) throw new AppError("notChanged");
  return rows;
}

/** 전체 프로젝트를 최신순으로 가져온다. */
export async function fetchProjects() {
  const rows = await run(getSupabase().from(TABLE).select(COLUMNS).order("created_at", { ascending: false }));
  return rows.map(fromRow);
}

/** id로 프로젝트 하나를 가져온다. 없으면 "notFound" 오류. */
export async function fetchProjectById(id) {
  const row = await run(getSupabase().from(TABLE).select(COLUMNS).eq("id", id).maybeSingle());
  if (!row) throw new AppError("notFound");
  return fromRow(row);
}

/** 새 프로젝트를 저장하고 저장된 프로젝트(id 포함)를 돌려준다. */
export async function createProject(project) {
  const row = await run(getSupabase().from(TABLE).insert(toRow(project)).select(COLUMNS).single());
  return fromRow(row);
}

/** 프로젝트를 수정하고 수정된 프로젝트를 돌려준다. */
export async function updateProject(id, project) {
  const rows = ensureChanged(await run(getSupabase().from(TABLE).update(toRow(project)).eq("id", id).select(COLUMNS)));
  return fromRow(rows[0]);
}

/** 프로젝트를 삭제한다. */
export async function deleteProject(id) {
  ensureChanged(await run(getSupabase().from(TABLE).delete().eq("id", id).select("id")));
}
