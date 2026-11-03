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
--    security definer: admin_users 표를 직접 볼 권한이 없어도 "내가 관리자인지"만 확인할 수 있게 합니다.
--    search_path = '': 다른 스키마의 같은 이름 객체로 바꿔치기하는 공격을 막습니다.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- 로그인한 사용자만 이 함수를 부를 수 있습니다. (React의 관리자 버튼 표시에 사용)
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

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
  with check ((select public.is_admin()));

create policy "projects_update_admin" on public.projects
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "projects_delete_admin" on public.projects
  for delete to authenticated
  using ((select public.is_admin()));

-- 4) 테이블 접근 권한
--    방문자(anon): 조회만. 수정·삭제를 시도하면 권한 오류(permission denied)가 납니다.
--    로그인 사용자(authenticated): 명령 자체는 허용하지만, 위 RLS 정책이 관리자만 통과시킵니다.
revoke all on public.projects from anon;
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;

--    관리자 목록은 방문자가 볼 수 없고, 로그인 사용자는 자기 행만 볼 수 있습니다.
--    추가·삭제 정책이 없으므로 관리자 등록은 SQL Editor(03_register_admin.sql)에서만 가능합니다.
revoke all on public.admin_users from anon;
grant select on public.admin_users to authenticated;
