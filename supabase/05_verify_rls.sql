-- =============================================================
-- 05. (확인용) RLS가 사용자별로 제대로 막는지 시험하기
--
-- ▶ 사용 방법: 아래 블록(A, B, C)을 "하나씩" 마우스로 선택한 뒤 [Run]
--   (선택한 부분만 실행됩니다. 한 블록 안에서 오류가 나면 그 뒤 문장은 실행되지 않습니다.)
-- ▶ 모든 블록은 마지막 rollback으로 끝나므로 실제 데이터는 바뀌지 않습니다.
-- ▶ 블록 C의 'admin@example.com'은 03에서 등록한 관리자 이메일로 바꾸세요.
--
-- 이 파일은 코드 작성 시점에 실제 DB에서 실행해 보지 않았습니다. 결과를 직접 확인해 주세요.
-- =============================================================


-- ───────── 블록 A. 방문자(로그인 안 함, anon) ─────────
-- 기대 결과
--   1번 select: 전체 프로젝트 개수가 나옴 (조회 허용)
--   2번 delete: ERROR "permission denied for table projects" (삭제 차단) ← 이 오류가 나면 정상
begin;
set local role anon;
select count(*) as "방문자가 볼 수 있는 프로젝트 수" from public.projects;
delete from public.projects;
rollback;


-- ───────── 블록 B. 로그인했지만 관리자가 아닌 사용자 ─────────
-- 기대 결과
--   is_admin: false
--   삭제된 행 수: 0  (RLS가 조용히 걸러냄)
--   수정된 행 수: 0
--   마지막 insert: ERROR "new row violates row-level security policy" ← 이 오류가 나면 정상
begin;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
set local role authenticated;
select public.is_admin() as is_admin;
with deleted as (delete from public.projects returning id) select count(*) as "삭제된 행 수" from deleted;
with updated as (update public.projects set title = title returning id) select count(*) as "수정된 행 수" from updated;
insert into public.projects (title, summary, description, category) values ('rls-test', 'rls-test', 'rls-test', 'ai');
rollback;


-- ───────── 블록 C. 관리자 ─────────
-- 기대 결과
--   is_admin: true  (false면 03_register_admin.sql의 이메일 확인)
--   등록·수정·삭제가 모두 1행씩 성공
--   마지막 rollback으로 시험 데이터는 남지 않음
begin;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', (select id::text from auth.users where email = 'admin@example.com'), 'role', 'authenticated')::text,
  true
);
set local role authenticated;
select public.is_admin() as is_admin;
with inserted as (
  insert into public.projects (title, summary, description, category)
  values ('rls-admin-test', 'rls-admin-test', 'rls-admin-test', 'ai')
  returning id
) select count(*) as "등록된 행 수" from inserted;
with updated as (update public.projects set summary = 'updated' where title = 'rls-admin-test' returning id) select count(*) as "수정된 행 수" from updated;
with deleted as (delete from public.projects where title = 'rls-admin-test' returning id) select count(*) as "삭제된 행 수" from deleted;
rollback;
