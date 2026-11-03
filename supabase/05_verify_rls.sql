-- =============================================================
-- 05. (확인용) RLS 안전 점검 — 실제 프로젝트 데이터는 절대 바뀌지 않습니다
--
-- ▶ 사용 방법
--   1) 아래 admin_email 의 'admin@example.com' 을 03에서 등록한 관리자 이메일로 바꿉니다.
--   2) 파일 "전체"를 붙여넣고 [Run] 합니다.
--      (일부만 선택해서 실행하면 문법 오류가 나고 아무 일도 일어나지 않습니다.)
--
-- ▶ 결과 읽는 법
--   마지막에 빨간 ERROR 상자가 뜨는 것이 "정상"입니다.
--   이 ERROR는 시험 중 만든 변경을 모두 되돌리기(rollback) 위해 일부러 발생시키는 것이며,
--   메시지 첫 줄에 "✅ RLS 점검 통과" 또는 "❌ RLS 점검 실패 n건", 그 아래 항목별 결과가 있습니다.
--
-- ▶ 왜 안전한가
--   - 전체가 DO 블록 하나(문장 1개)라서 중간까지만 실행될 수 없습니다.
--   - 모든 DELETE/UPDATE는 이 블록이 직접 만든 '__rls_test__' 행만 WHERE 조건으로 대상으로 합니다.
--     권한 설정이 잘못되어 있어도 실제 프로젝트 행은 조건에 걸리지 않습니다.
--   - 시험 하나하나를 저장점(savepoint) 안에서 실행하고 곧바로 되돌린 뒤 결과 숫자만 기록합니다.
--   - 마지막에 오류를 일으켜 시험용 행까지 전부 취소합니다.
--   - 시험 전·후 실제 프로젝트 개수를 비교해 결과에 함께 보여줍니다.
--
-- 이 파일은 실제 Supabase에서는 아직 실행해 보지 않았습니다. (로컬 PostgreSQL 모의 환경에서만 확인)
-- =============================================================

do $rls_test$
declare
  admin_email constant text := 'admin@example.com';   -- ← 관리자 이메일로 바꾸세요
  marker constant text := '__rls_test__';
  member_claims constant text := '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}';
  admin_id uuid;
  real_before bigint;
  real_after bigint;
  n_select bigint;
  n_delete bigint;
  n_update bigint;
  n_insert bigint;
  admin_flag boolean;
  report text := '';
  failures int := 0;
begin
  -- 0) 준비: RLS 확인, 실제 데이터 개수 기록, 시험용 행 1개 만들기
  if not (select relrowsecurity from pg_class where oid = 'public.projects'::regclass) then
    raise exception '❌ projects 테이블의 RLS가 꺼져 있습니다. 02_policies.sql을 먼저 실행하세요. (아무것도 바뀌지 않았습니다)';
  end if;

  select count(*) into real_before from public.projects where title not like marker || '%';
  select id into admin_id from auth.users where email = admin_email;

  insert into public.projects (title, summary, description, category)
  values (marker || 'target', marker, marker, 'ai');

  -- 같은 순서로 세 역할을 시험한다. 결과 숫자: -1 = 권한 오류로 차단, 0 이상 = 바뀐 행 수
  for role_index in 1..3 loop
    if role_index = 1 then
      perform set_config('request.jwt.claims', '{"role":"anon"}', true);
      set local role anon;
    elsif role_index = 2 then
      perform set_config('request.jwt.claims', member_claims, true);
      set local role authenticated;
    else
      if admin_id is null then
        report := report || format(E'\n[관리자] ⚠ %s 계정을 찾지 못해 건너뜀 (admin_email 확인)', admin_email);
        failures := failures + 1;
        exit;
      end if;
      perform set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role', 'authenticated')::text, true);
      set local role authenticated;
    end if;

    select count(*) into n_select from public.projects where title like marker || '%';
    admin_flag := false;
    if role_index > 1 then
      admin_flag := public.is_admin();
    end if;

    begin
      delete from public.projects where title like marker || '%';
      get diagnostics n_delete = row_count;
      raise exception using errcode = 'RT001';
    exception
      when insufficient_privilege then n_delete := -1;
      when sqlstate 'RT001' then null;
    end;

    begin
      update public.projects set summary = 'rls-check' where title like marker || '%';
      get diagnostics n_update = row_count;
      raise exception using errcode = 'RT001';
    exception
      when insufficient_privilege then n_update := -1;
      when sqlstate 'RT001' then null;
    end;

    begin
      insert into public.projects (title, summary, description, category) values (marker || 'insert', marker, marker, 'ai');
      get diagnostics n_insert = row_count;
      raise exception using errcode = 'RT001';
    exception
      when insufficient_privilege then n_insert := -1;
      when sqlstate 'RT001' then null;
    end;

    reset role;

    if role_index < 3 then
      -- 방문자·일반 계정: 조회는 되고, 쓰기는 권한 오류(-1) 또는 0행이어야 한다
      report := report || format(
        E'\n[%s] 조회 %s / 삭제 %s / 수정 %s / 등록 %s%s',
        case when role_index = 1 then '방문자' else '일반 계정' end,
        case when n_select = 1 then '✅' else '❌' end,
        case when n_delete <= 0 then '차단 ✅' else '❌ 허용됨' end,
        case when n_update <= 0 then '차단 ✅' else '❌ 허용됨' end,
        case when n_insert < 0 then '차단 ✅' else '❌ 허용됨' end,
        case when role_index = 2 then case when admin_flag then ' / is_admin ❌ true' else ' / is_admin false ✅' end else '' end
      );
      failures := failures
        + (n_select <> 1)::int + (n_delete > 0)::int + (n_update > 0)::int + (n_insert >= 0)::int
        + (role_index = 2 and admin_flag)::int;
    else
      -- 관리자: 모두 1행씩 성공해야 한다
      report := report || format(
        E'\n[관리자] is_admin %s / 등록 %s / 수정 %s / 삭제 %s',
        case when admin_flag then 'true ✅' else '❌ false (03_register_admin.sql 확인)' end,
        case when n_insert = 1 then '✅' else '❌' end,
        case when n_update = 1 then '✅' else '❌' end,
        case when n_delete = 1 then '✅' else '❌' end
      );
      failures := failures + (not admin_flag)::int + (n_insert <> 1)::int + (n_update <> 1)::int + (n_delete <> 1)::int;
    end if;
  end loop;

  -- 실제 프로젝트가 그대로인지 확인
  select count(*) into real_after from public.projects where title not like marker || '%';
  report := report || format(E'\n[실제 데이터] 시험 전 %s건 → 시험 후 %s건 %s', real_before, real_after,
    case when real_before = real_after then '✅' else '❌' end);
  failures := failures + (real_before <> real_after)::int;

  raise exception '%', case when failures = 0 then '✅ RLS 점검 통과' else format('❌ RLS 점검 실패 %s건', failures) end
    || report
    || E'\n※ 이 ERROR는 시험용 변경을 모두 되돌리기 위한 정상 동작입니다. 실제 데이터는 바뀌지 않았습니다.';
end
$rls_test$;
