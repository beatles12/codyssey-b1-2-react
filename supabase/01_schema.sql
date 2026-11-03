-- =============================================================
-- 01. projects 테이블 만들기
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 [Run]을 누릅니다.
-- 여러 번 실행해도 안전하도록 if not exists / or replace를 사용했습니다.
-- 열 이름·글자 수 제한·분류 값은 React 코드(src/lib/projectsApi.js, projectForm.js)와 같아야 합니다.
-- (src/lib/schemaSync.test.js가 자동으로 비교합니다)
-- =============================================================

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 60),
  summary     text not null check (char_length(summary) between 1 and 120),
  description text not null check (char_length(description) > 0),
  category    text not null check (category in ('planning', 'education', 'ai', 'startup', 'development')),
  tech_stack  text[] not null default '{}',
  role        text,
  period      text,
  github_url  text,
  demo_url    text,
  image_url   text,
  is_featured boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 주소 형식 제약 (src/lib/validators.js 의 URL_PATTERN, SITE_PATH_PATTERN 과 같은 규칙)
--   링크(github_url, demo_url): http:// 또는 https:// 로 시작, 공백 없음
--   이미지(image_url): 위 링크 규칙, 또는 "/" 하나로 시작하는 사이트 안 경로 (예: /images/budget.png)
--   "//example.com", "/\example.com", "javascript:..." 는 거절됩니다.
-- 예전 버전의 01을 이미 실행했어도 다시 실행하면 새 규칙으로 바뀝니다.
alter table public.projects drop constraint if exists projects_github_url_check;
alter table public.projects drop constraint if exists projects_demo_url_check;
alter table public.projects drop constraint if exists projects_image_url_check;
alter table public.projects add constraint projects_github_url_check
  check (github_url is null or github_url ~* '^https?://[^[:space:]]+$');
alter table public.projects add constraint projects_demo_url_check
  check (demo_url is null or demo_url ~* '^https?://[^[:space:]]+$');
alter table public.projects add constraint projects_image_url_check
  check (image_url is null or image_url ~* '^https?://[^[:space:]]+$' or image_url ~ '^/[A-Za-z0-9_.~%-][A-Za-z0-9_.~%/-]*$');

-- 수정할 때마다 updated_at을 현재 시각으로 바꿉니다.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
