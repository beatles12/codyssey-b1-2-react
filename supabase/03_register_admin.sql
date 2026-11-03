-- =============================================================
-- 03. 관리자 계정 등록
-- 먼저 Authentication > Users 에서 관리자 계정을 만든 뒤 실행합니다.
-- 아래 'admin@example.com'을 방금 만든 관리자 이메일로 바꾸세요.
-- (비밀번호는 여기에 적지 않습니다. 비밀번호는 Supabase가 안전하게 보관합니다.)
-- =============================================================

insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@example.com'
on conflict (user_id) do nothing;

-- 확인: 1행이 나오면 등록 완료
select u.email, a.created_at
from public.admin_users a
join auth.users u on u.id = a.user_id;
