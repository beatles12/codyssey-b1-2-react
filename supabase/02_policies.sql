-- =============================================================
-- 02. 관리자 전용 쓰기 권한 (RLS: Row Level Security)
-- 01_schema.sql 다음에 실행합니다.
--
-- 결과
--   - 누구나(로그인 안 한 방문자 포함) 프로젝트를 "조회"할 수 있습니다.
--   - admin_users 표에 등록된 계정만 "등록·수정·삭제"할 수 있습니다.
--   - 화면에서 버튼을 숨기는 것과 상관없이, DB가 직접 요청을 거절합니다.
-- =============================================================

-- 1) 관리자 목록 표
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own" on public.admin_users
  for select to authenticated
  using (user_id = auth.uid());

-- 2) 지금 로그인한 사용자가 관리자인지 확인하는 함수
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- 3) projects 테이블 RLS
alter table public.projects enable row level security;

drop policy if exists "projects_select_all" on public.projects;
drop policy if exists "projects_insert_admin" on public.projects;
drop policy if exists "projects_update_admin" on public.projects;
drop policy if exists "projects_delete_admin" on public.projects;

create policy "projects_select_all" on public.projects
  for select to anon, authenticated
  using (true);

create policy "projects_insert_admin" on public.projects
  for insert to authenticated
  with check (public.is_admin());

create policy "projects_update_admin" on public.projects
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "projects_delete_admin" on public.projects
  for delete to authenticated
  using (public.is_admin());

-- 4) 테이블 접근 권한 (방문자 anon은 조회만)
revoke all on public.projects from anon;
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
