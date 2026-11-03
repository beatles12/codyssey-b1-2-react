# OWNER CHECKLIST — 직접 해야 하는 일만 순서대로

> Windows + 크롬 기준, 처음 해 보는 사람용입니다. 약 40~60분 걸립니다.
> 이 문서에는 실제 비밀번호·키가 없습니다. 여러분의 비밀번호·키도 **이 문서나 GitHub에 적지 마세요.**
> 각 단계의 ✅ 표시를 하나씩 체크하며 진행하세요.

준비물: GitHub 계정, 이 저장소를 내려받은 PC, Node.js(LTS), VS Code(권장)

---

## 0단계. 내 PC에서 코드 준비 (처음 한 번)

1. **시작 메뉴** → `PowerShell` 입력 → **Windows PowerShell** 열기
2. 아래 명령을 한 줄씩 붙여넣고 Enter (붙여넣기: 마우스 오른쪽 클릭)

```bash
cd $HOME\Documents
```

```bash
git clone https://github.com/beatles12/codyssey-b1-2-react.git
```

```bash
cd codyssey-b1-2-react
```

```bash
git checkout claude/epic-clarke-mmra67
```

```bash
npm install
```

- **정상 화면**: 마지막에 `added ... packages` 문구
- **오류: `git` / `npm`을 찾을 수 없음** → https://git-scm.com , https://nodejs.org (LTS) 설치 후 PowerShell을 껐다 다시 열기
- ✅ `npm test` 실행 시 `Tests 145 passed` 확인

---

## 1단계. Supabase 계정·프로젝트 만들기

1. 크롬에서 https://supabase.com 접속 → 오른쪽 위 **Start your project**
2. **Continue with GitHub** → GitHub 로그인·승인
3. 첫 화면에서 **New project** (조직을 만들라고 하면 이름 아무거나, Free 플랜)
4. 입력
   | 칸 | 입력 |
   | --- | --- |
   | Name | `codyssey-b1-2-portfolio` |
   | Database Password | **Generate a password** 클릭 → 비밀번호 관리자(또는 종이)에 보관. 앱에서는 쓰지 않음 |
   | Region | `Northeast Asia (Seoul)` |
5. **Create new project** → 1~2분 기다리면 프로젝트 대시보드가 열림

- **정상 화면**: 왼쪽에 Table Editor, SQL Editor, Authentication 메뉴가 보임
- **오류: 무료 프로젝트 개수 초과** → 쓰지 않는 기존 프로젝트를 일시정지(Pause)하거나 삭제
- ✅ 프로젝트 대시보드가 열림

---

## 2단계. SQL 실행 (테이블 + 권한)

> 파일 위치: 내려받은 폴더의 `supabase\` 폴더. VS Code나 메모장으로 열어 **전체 선택(Ctrl+A) → 복사(Ctrl+C)**

1. 왼쪽 메뉴 **SQL Editor** → 위쪽 **+ New query** (또는 New snippet)
2. `01_schema.sql` 내용 붙여넣기(Ctrl+V) → 오른쪽 아래 **Run** (또는 Ctrl+Enter)
   - **정상**: `Success. No rows returned`
3. 다시 **+ New query** → `02_policies.sql` 붙여넣기 → **Run**
   - **정상**: `Success. No rows returned`
4. 확인: 왼쪽 **Table Editor** → `projects` 클릭 → 위쪽에 **RLS enabled**(또는 자물쇠 표시)

| 오류 메시지 | 원인 / 해결 |
| --- | --- |
| `relation "public.projects" does not exist` (02 실행 시) | 01을 먼저 실행하지 않음 → 01 실행 후 02 |
| `syntax error` | 일부만 복사됨 → 파일 전체를 다시 복사 |
| `already exists` NOTICE | 정상(이미 만들어져 있음). 두 번 실행해도 괜찮게 만들어 둠 |

- ✅ `projects`, `admin_users` 테이블이 보이고 RLS enabled

---

## 3단계. 관리자 계정 만들기

### 3-1. 공개 회원가입 끄기

1. 왼쪽 **Authentication** → **Sign In / Providers** (버전에 따라 **Providers** 또는 **Settings**)
2. **Allow new users to sign up** → **OFF** → **Save changes**
3. **Email** 제공자는 **켜진 상태** 유지

### 3-2. 관리자 계정 생성

1. **Authentication** → **Users** → 오른쪽 위 **Add user** → **Create new user**
2. Email: 관리자로 쓸 내 이메일 / Password: 새 비밀번호(비밀번호 관리자에 보관)
3. **Auto Confirm User** 체크 → **Create user**

### 3-3. 관리자로 등록

1. **SQL Editor** → **+ New query** → `03_register_admin.sql` 붙여넣기
2. `'admin@example.com'`을 **3-2에서 만든 이메일**로 바꾸기 (따옴표는 남기기)
3. **Run** → 결과 표에 내 이메일 1줄이 나오면 성공

| 결과 | 해결 |
| --- | --- |
| 결과 0줄 | 이메일 오타 / 3-2를 아직 안 함 → Users 화면의 이메일을 그대로 복사 |

- ✅ 회원가입 OFF, 관리자 1명 등록

---

## 4단계. 환경변수 설정 (`.env`)

1. Supabase 왼쪽 아래 톱니바퀴 **Project Settings** → **API** (또는 **Data API**, **API Keys**)
2. 복사할 것 두 가지
   - **Project URL** — `https://`로 시작, `.supabase.co`로 끝남
   - **anon public** 키 (또는 **Publishable key**, `sb_publishable_…`)
   - ⚠️ **service_role / secret 키는 절대 복사하지 않기**
3. VS Code에서 프로젝트 폴더 열기 → `.env.example` 파일을 복사해 같은 폴더에 `.env` 이름으로 붙여넣기
   (PowerShell: `copy .env.example .env`)
4. `.env`를 열어 `=` 뒤에 붙여넣기 (따옴표·공백 없이)

```text
VITE_SUPABASE_URL=여기에_Project_URL
VITE_SUPABASE_ANON_KEY=여기에_anon_키
VITE_FORMSPREE_ID=
```

5. 저장(Ctrl+S) → PowerShell에서 `git status` 실행 → **`.env`가 목록에 없어야 정상** (.gitignore로 제외됨)

- ✅ `.env` 작성, `git status`에 `.env` 안 보임

---

## 5단계. 실제 CRUD 및 권한 테스트

```bash
npm run dev
```

크롬에서 http://localhost:5173 (`.env`를 바꾼 뒤에는 PowerShell에서 Ctrl+C → 다시 `npm run dev`)

### 5-1. 방문자 테스트 (로그인 전)

| # | 할 일 | 정상 결과 | ✅ |
| --- | --- | --- | --- |
| 1 | `/projects` 열기 | "아직 등록된 프로젝트가 없습니다." (오류 상자 아님) | |
| 2 | 주소창에 `/projects/new` | 로그인 화면으로 이동 | |
| 3 | 헤더에 New·Logout 없음 | 없음 | |

### 5-2. 관리자 테스트

| # | 할 일 | 정상 결과 | ✅ |
| --- | --- | --- | --- |
| 4 | 푸터 **Admin** → 관리자 이메일·비밀번호 로그인 | "관리자로 로그인했습니다.", 헤더에 New·Logout | |
| 5 | **New** → 제목·한 줄 소개·설명 입력 → 등록하기 | 상세 화면 + "프로젝트를 등록했습니다." | |
| 6 | Supabase **Table Editor → projects** | 방금 만든 행이 보임 (진짜 저장됨!) | |
| 7 | 상세에서 **수정** → 제목 바꾸고 저장 | 바뀐 제목 + "프로젝트를 수정했습니다." | |
| 8 | **삭제** → 확인 창에서 삭제 | 목록으로 이동 + "프로젝트를 삭제했습니다." | |
| 9 | **Logout** | 수정·삭제 버튼 사라짐 | |

### 5-3. DB 권한(RLS) 테스트 — 꼭 하세요

1. **SQL Editor** → `05_verify_rls.sql` 붙여넣기
2. 블록 C의 `'admin@example.com'`을 내 관리자 이메일로 바꾸기
3. **블록 A 부분만 마우스로 드래그해 선택** → Run → 다음 표와 비교
4. 블록 B, 블록 C도 하나씩 선택해서 Run

| 블록 | 정상 결과 |
| --- | --- |
| A 방문자 | 개수가 나온 뒤 `permission denied for table projects` 오류 (= 삭제 차단, 정상) |
| B 일반 로그인 사용자 | is_admin `false`, 삭제 0, 수정 0, 마지막에 `violates row-level security policy` 오류 (= 정상) |
| C 관리자 | is_admin `true`, 등록·수정·삭제 각 1 (rollback으로 실제 데이터는 그대로) |

결과가 다르면 [security-review.md](security-review.md)의 "결과가 다를 때"를 보세요.

### 5-4. (선택) 예시 데이터

`04_seed.sql` 실행 → B1-1 프로젝트 4개가 들어감. 설명은 직접 보완하세요.

- ✅ 5-1 ~ 5-3 모두 정상

---

## 6단계. Vercel 배포

1. https://vercel.com → **Sign Up** → **Continue with GitHub**
2. **Add New…** → **Project** → `codyssey-b1-2-react` 옆 **Import**
   (안 보이면 **Adjust GitHub App Permissions**에서 저장소 접근 허용)
3. 설정 화면
   - Framework Preset: **Vite** (자동 인식)
   - **Environment Variables** 펼치기 → 4단계 `.env`와 같은 이름·값으로 2~3개 추가
     (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, 필요하면 `VITE_FORMSPREE_ID`)
4. 배포할 브랜치: 처음엔 기본 브랜치가 배포됩니다. main 병합 전이라면 **Settings → Git → Production Branch**를 확인하세요. (병합 여부는 Claude와 상의 후 결정)
5. **Deploy** → 1~2분 → **Congratulations** 화면의 주소(예: `https://codyssey-b1-2-react.vercel.app`) 복사
6. Supabase **Authentication → URL Configuration → Site URL**에 그 주소 입력 → Save
7. 배포 주소에서 **5-1, 5-2 표를 다시** 진행 (새로고침해도 404가 안 나는지도 확인)

| 증상 | 해결 |
| --- | --- |
| 배포 사이트에서 "Supabase 연결 정보가 없습니다" | Vercel 환경변수 누락·오타 → Settings → Environment Variables 수정 → **Deployments → Redeploy** |
| 새로고침하면 404 | `vercel.json`이 있는 브랜치인지 확인 |
| 로그인은 되는데 New가 안 보임 | 3-3 관리자 등록 확인 |

- ✅ 배포 주소에서 방문자·관리자 테스트 통과

---

## 7단계. 최종 GitHub 제출 확인

| 확인 | 방법 | ✅ |
| --- | --- | --- |
| `.env`가 GitHub에 없음 | GitHub 저장소 파일 목록에 `.env` 없음 (`.env.example`만) | |
| 비밀번호·secret 키 없음 | GitHub 저장소 검색창에서 `service_role`, 내 비밀번호 일부 검색 → 문서 안내 문구 외 결과 없음 | |
| README에 배포 URL | README의 "배포 URL: 아직 없음"을 실제 주소로 바꾸기 (Claude에게 요청 가능) | |
| main 병합 | Claude와 상의 후 PR로 병합 | |
| 제출 | 배포 URL + https://github.com/beatles12/codyssey-b1-2-react | |
| 보안 체크리스트 | [security-audit.md](security-audit.md) 마지막 체크리스트 | |

---

### 막히면

- 오류 메시지 전체를 복사해서 Claude에게 보여 주세요. (비밀번호·키는 지우고)
- 자세한 설명: [supabase-setup.md](supabase-setup.md), 보안: [security-review.md](security-review.md)
