// Supabase projects 테이블의 CRUD 함수. 화면 코드는 이 파일만 부르고 Supabase를 직접 다루지 않는다.
import { AppError } from "./errors.js";
import { createProjectId } from "./id.js";
import { withTimeout } from "./request.js";
import { getSupabase } from "./supabaseClient.js";

const TABLE = "projects";
const DUPLICATE_KEY = "23505";
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

/** id인 행이 지금 DB에 있는지 확인한다. (수정·삭제가 0행일 때 원인을 구분하는 데 사용) */
async function existsProject(id) {
  const row = await run(getSupabase().from(TABLE).select("id").eq("id", id).maybeSingle());
  return Boolean(row);
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

/**
 * 새 프로젝트를 저장하고 저장된 프로젝트를 돌려준다.
 * id는 등록 화면이 한 번 만들어 다시 시도할 때도 같은 값을 보낸다. 시간 초과된 이전 시도가 늦게 저장되어
 * 같은 id가 이미 있으면(중복 키 오류) 새로 만들지 않고 그 행을 지금 내용으로 수정한다. → 중복 등록 방지
 */
export async function createProject(project, id = createProjectId()) {
  try {
    const row = await run(getSupabase().from(TABLE).insert({ id, ...toRow(project) }).select(COLUMNS).single());
    return fromRow(row);
  } catch (error) {
    if (error?.code !== DUPLICATE_KEY) throw error;
    return updateProject(id, project);
  }
}

/** 프로젝트를 수정하고 수정된 프로젝트를 돌려준다. 0행이면 행이 없는지(notFound) 권한 문제인지(notChanged) 구분한다. */
export async function updateProject(id, project) {
  const rows = await run(getSupabase().from(TABLE).update(toRow(project)).eq("id", id).select(COLUMNS));
  if (rows.length > 0) return fromRow(rows[0]);
  throw new AppError((await existsProject(id)) ? "notChanged" : "notFound");
}

/**
 * 프로젝트를 삭제한다. 0행인데 행이 남아 있으면 권한 문제(notChanged)로 오류를 던지고,
 * 행이 이미 없으면(시간 초과 뒤 다시 누른 경우 등) 이미 삭제된 것이므로 성공으로 본다.
 */
export async function deleteProject(id) {
  const rows = await run(getSupabase().from(TABLE).delete().eq("id", id).select("id"));
  if (rows.length > 0) return;
  if (await existsProject(id)) throw new AppError("notChanged");
}
