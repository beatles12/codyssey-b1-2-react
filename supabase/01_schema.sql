-- =============================================================
-- 01. projects 테이블 만들기
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 [Run]을 누릅니다.
-- 여러 번 실행해도 안전하도록 if not exists / or replace를 사용했습니다.
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
