# Supabase 연결·관리자 설정 안내서

> 이 문서의 모든 단계는 **직접** 진행합니다. 코드(Claude)는 실제 Supabase 계정·DB를 만들거나 바꾸지 않았습니다.
> 준비물: GitHub 계정, 이 저장소를 내려받은 컴퓨터, 약 20분.

전체 순서

1. Supabase 프로젝트 만들기
2. 테이블 만들기 (`supabase/01_schema.sql`)
3. 관리자 전용 권한(RLS) 켜기 (`supabase/02_policies.sql`)
4. 공개 회원가입 끄기
5. 관리자 계정 만들고 등록하기 (`supabase/03_register_admin.sql`)
6. `.env` 파일에 연결 정보 넣기
7. 로컬에서 확인하기
8. (선택) 예시 데이터 넣기 (`supabase/04_seed.sql`)
9. 권한 차단 시험하기 (`supabase/05_verify_rls.sql`)

---

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 접속 → **Start your project** → GitHub 계정으로 로그인
2. **New project** 클릭
3. 입력
   - Name: `codyssey-b1-2-portfolio` (자유)
   - Database Password: **[Generate a password]** 버튼으로 만들고 비밀번호 관리자에 따로 보관
     (이 비밀번호는 앱 코드에 쓰지 않습니다. 어디에도 붙여넣지 마세요.)
   - Region: `Northeast Asia (Seoul)`
4. **Create new project** → 1~2분 기다리기

## 2. 테이블 만들기

1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. 저장소의 `supabase/01_schema.sql` 내용을 전부 복사해 붙여넣기 → **Run**
3. "Success. No rows returned" 가 나오면 성공
4. 왼쪽 **Table Editor**에 `projects` 테이블이 보이는지 확인

## 3. 관리자 전용 권한(RLS) 켜기

1. **SQL Editor** → **New query**
2. `supabase/02_policies.sql` 붙여넣기 → **Run**
3. **Table Editor** → `projects` 위에 `RLS enabled` 표시가 있는지 확인

이 단계가 실제 보안입니다. 화면에서 수정·삭제 버튼을 숨기는 것은 편의 기능일 뿐이고, 누군가 개발자 도구로 직접 요청을 보내도 **DB가 거절**하게 만드는 것이 RLS입니다.

| 누가 | 조회 | 등록·수정·삭제 |
| --- | --- | --- |
| 방문자 (로그인 안 함, `anon`) | ✅ | ❌ |
| 로그인했지만 `admin_users`에 없는 계정 | ✅ | ❌ |
| `admin_users`에 등록된 관리자 | ✅ | ✅ |

## 4. 공개 회원가입 끄기

1. 왼쪽 **Authentication** → **Sign In / Providers** (메뉴 이름은 Supabase 버전에 따라 조금 다를 수 있습니다)
2. **Allow new users to sign up** 를 **끔(OFF)** → **Save**
3. 같은 화면의 **Email** 제공자는 켜진 상태로 둡니다(관리자 로그인에 사용).

## 5. 관리자 계정 만들고 등록하기

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. 관리자 이메일과 비밀번호 입력, **Auto Confirm User** 체크 → **Create user**
   - 비밀번호는 비밀번호 관리자에만 보관합니다. 코드·GitHub·`.env`에 적지 않습니다.
3. **SQL Editor** → `supabase/03_register_admin.sql` 붙여넣기
4. `'admin@example.com'` 부분을 방금 만든 관리자 이메일로 바꾸고 **Run**
5. 결과 표에 관리자 이메일 1행이 보이면 완료

## 6. `.env` 파일에 연결 정보 넣기

1. Supabase 왼쪽 아래 **Project Settings** → **API** (또는 **Data API** / **API Keys**)
2. 두 값을 복사
   - **Project URL** (예: `https://abcd1234.supabase.co`)
   - **anon public** 키 (`eyJ...`로 시작하는 긴 문자열, 또는 `sb_publishable_...`)
3. 프로젝트 폴더에서 `.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

```text
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_FORMSPREE_ID=
```

> ⚠️ **절대 넣지 말 것:** `service_role` 키(또는 `sb_secret_...`). 이 키는 RLS를 무시하는 관리자 열쇠입니다.
> `anon` 키는 브라우저에 노출되도록 만들어진 공개 키이며, 데이터 보호는 3단계의 RLS가 맡습니다.
> `.env`는 `.gitignore`에 들어 있어 GitHub에 올라가지 않습니다. (`git status`에 `.env`가 보이면 안 됩니다.)

## 7. 로컬에서 확인하기

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173/projects 를 열면

- 설정 전: "Supabase 연결 정보가 없습니다…" 오류 상자 → `.env` 확인
- 설정 후 데이터 없음: "아직 등록된 프로젝트가 없습니다." → 연결 성공!

`.env`를 고친 뒤에는 개발 서버를 껐다가(`Ctrl + C`) 다시 `npm run dev` 해야 반영됩니다.

## 8. (선택) 예시 데이터 넣기

`supabase/04_seed.sql`을 SQL Editor에서 실행하면 B1-1의 프로젝트 4개가 들어갑니다. 설명은 B1-1에 있던 내용뿐이므로 화면에서 직접 보완하세요.

## 9. 권한 차단 시험하기 (꼭 해 보세요)

### SQL로 시험

`supabase/05_verify_rls.sql`의 블록 A(방문자)·B(일반 로그인)·C(관리자)를 **하나씩 선택해서** 실행합니다. 각 블록은 `rollback`으로 끝나 데이터가 바뀌지 않습니다.

| 블록 | 정상 결과 |
| --- | --- |
| A | 조회 개수 → `permission denied for table projects` 오류 |
| B | is_admin false, 삭제 0, 수정 0 → `violates row-level security policy` 오류 |
| C | is_admin true, 등록·수정·삭제 각 1 |

(작업 환경의 로컬 PostgreSQL 모의 실행에서는 위와 같았지만, 실제 Supabase에서는 아직 실행하지 않았습니다. 자세한 내용: [security-review.md](security-review.md))

### 화면으로 시험

| 순서 | 할 일 | 기대 결과 |
| --- | --- | --- |
| 1 | 로그아웃 상태로 `/projects` | 목록이 보이고 "새 프로젝트 등록" 버튼은 없음 |
| 2 | 로그아웃 상태로 `/projects/new` 주소 직접 입력 | 로그인 화면으로 이동 |
| 3 | `/login`에서 관리자 로그인 | "관리자로 로그인했습니다." 알림, 헤더에 New·Logout |
| 4 | 등록 → 상세 → 수정 → 삭제 | 각 단계 성공 알림, 목록에 반영 |
| 5 | 로그아웃 | 상세 화면에서 수정·삭제 버튼이 사라짐 |

## 10. 배포(Vercel) 때 할 일 — 승인 후 진행

1. Vercel → **Add New… → Project** → 이 GitHub 저장소 선택
2. **Environment Variables**에 `.env`와 같은 3개 값을 등록 (`VITE_` 이름 그대로)
3. **Deploy**
4. Supabase **Authentication → URL Configuration**의 **Site URL**을 Vercel 주소로 변경
5. 배포 주소에서 9단계 화면 시험을 다시 진행
6. `docs/security-audit.md`의 배포 전 체크리스트 확인

## 자주 겪는 문제

| 증상 | 원인과 해결 |
| --- | --- |
| "Supabase 연결 정보가 없습니다" | `.env` 파일 이름·위치(프로젝트 최상위)·변수 이름 확인 후 개발 서버 재시작 |
| 목록이 계속 비어 있음 | 데이터가 없는 것이 정상일 수 있음. Table Editor에서 행 확인 |
| 로그인 시 "이메일 또는 비밀번호가 올바르지 않습니다" | 5단계 계정의 이메일·비밀번호 확인, Auto Confirm 여부 확인 |
| 관리자로 로그인했는데 "변경되지 않았습니다…" | `03_register_admin.sql`의 이메일을 바꾸지 않았거나 실행하지 않음 → `admin_users`에 행이 있는지 확인 |
| "권한이 없습니다" (등록 시) | 위와 같음. RLS가 등록을 거절한 것 |
| 배포 사이트에서만 동작 안 함 | Vercel 환경변수 누락 → 등록 후 **Redeploy** |
| 관리자로 로그인했는데 "관리자 권한이 없는 계정" | `03_register_admin.sql` 미실행·이메일 오타, 또는 `02_policies.sql` 미실행(`is_admin` 함수 없음) |
| `permission denied for function is_admin` | 02의 `grant execute … to authenticated` 줄이 빠짐 → 02 다시 실행 |
| "relation public.projects does not exist" (앱 화면) | 01 미실행, 또는 다른 Supabase 프로젝트의 URL을 넣음 |
| 목록이 비고 오류도 없음 (데이터는 있는데) | RLS는 켜졌는데 SELECT 정책이 없음 → 02 다시 실행 |
| 새 키 형식(`sb_publishable_…`) | anon 키 자리에 그대로 넣으면 됨. `sb_secret_…`은 절대 넣지 않기 |
| Data API에 표가 안 보임 | Project Settings → Data API에서 `public` 스키마가 노출(Exposed)되어 있는지 확인 |
| 무료 프로젝트 일시정지(Paused) | 대시보드에서 **Restore** — 평가 전 미리 확인 |
| 이미지가 안 보임 | `/images/...`는 이 사이트의 `public/images` 파일만 가능. 외부 이미지는 `https://` 전체 주소 |
