-- =============================================================
-- 05. (확인용) RLS가 제대로 막는지 시험하기
-- 실제 데이터는 바뀌지 않습니다. 마지막의 rollback이 모든 변경을 취소합니다.
-- =============================================================

begin;

-- 방문자(anon) 역할로 바꿔서 시험
set local role anon;

select count(*) as "방문자가 볼 수 있는 프로젝트 수" from public.projects;   -- 전체 개수가 나와야 정상

delete from public.projects;                                               -- "DELETE 0" 이어야 정상 (아무것도 지워지지 않음)

-- 아래 insert는 권한 오류(permission denied 또는 row-level security)가 나야 정상입니다.
-- insert into public.projects (title, summary, description, category) values ('t', 's', 'd', 'ai');

rollback;
