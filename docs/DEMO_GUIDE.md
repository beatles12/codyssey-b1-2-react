# DEMO GUIDE — 시연 순서와 화면별 설명

> 발표·시연 때 이 순서대로 보여주면 됩니다. 각 항목마다 **화면에서 보여줄 것 → 관련 코드 → 실행 흐름**을 적었습니다.
> 코드와 흐름을 더 자세히 보고 싶으면 [B1-2_program_guide.html](B1-2_program_guide.html)(브라우저로 열기)을 함께 띄워 두세요.

## 시연 전에 꼭 구분할 것 — 모의 시연 vs 실서비스 시연

| 구분 | 언제 | 보여줄 수 있는 것 | 보여줄 수 없는 것 |
| --- | --- | --- | --- |
| **A. Supabase 연결 전** | 지금 상태 그대로 | 홈·About·메뉴·404·언어·테마·반응형·문의 폼 검사, 보호 라우트(로그인 화면으로 이동), "연결 정보 없음" 안내, **자동 테스트 실행 결과** | 실제 프로젝트 목록·등록·수정·삭제·로그인 성공 |
| **B. Supabase 연결 후** | [OWNER_CHECKLIST.md](OWNER_CHECKLIST.md) 1~5단계를 마친 뒤 | A의 전부 + 실제 CRUD, 관리자 로그인, 로그아웃 후 차단, RLS 점검 결과 | — |

- 지금까지 등록·수정·삭제·로그인은 **가짜 데이터(모의)로만** 검증되었습니다. A 상태에서 시연할 때는 "실제 DB 연결은 설정 후 확인 예정이며, 화면 흐름은 자동 테스트로 검증했다"고 설명합니다.
- B 상태에서도 등록·수정·삭제는 **시험용 프로젝트 하나로만** 시연합니다. 실제 포트폴리오 데이터를 지우지 않도록 주의하세요.

### 준비

```bash
npm install
```

```bash
npm run dev
```

크롬에서 http://localhost:5173 을 엽니다. (배포 후라면 Vercel 주소)
발표용으로 창을 두 개 띄우면 편합니다: 왼쪽 = 앱, 오른쪽 = `docs/B1-2_program_guide.html` 또는 VS Code.

---

## 1. 홈페이지 열기 (A·B 모두)

**보여줄 것**
- 첫 화면 제목이 한 글자씩 타이핑됨 (쉼표·마침표에서 잠깐 쉼)
- 아래로 스크롤하면 About → Expertise → Work → Contact가 차례로 떠오름
- Contact의 시루 일러스트, 라벤더 색상 (B1-1 디자인 계승)

**관련 코드**
- `src/pages/HomePage.jsx` — 섹션 순서
- `src/components/home/HeroSection.jsx` → `src/components/ui/TypingHeading.jsx` → `src/hooks/useTypingEffect.js`
- `src/components/ui/RevealSection.jsx` → `src/hooks/useInView.js`

**실행 흐름**
1. `HeroSection`이 `TypingHeading`에 `startDelay={550}`을 줌
2. `useInView`가 제목이 화면에 들어온 것을 알려 줌(`IntersectionObserver`)
3. `useTypingEffect`의 useEffect가 `setTimeout`으로 다음 글자를 예약 → `typedCount` state 증가 → 다시 그림
4. 섹션은 `useInView`가 `true`가 되면 `visible` 클래스가 붙어 CSS 애니메이션으로 떠오름

> 운영체제의 "움직임 줄이기" 설정이 켜져 있으면 타이핑 없이 전체 제목이 바로 보입니다(정상).

## 2. 메뉴 이동 (A·B 모두)

**보여줄 것**
- 헤더 About → `/about`, Work → `/projects`, Contact → 홈의 문의 영역, 로고 → 홈
- 주소창이 바뀌지만 페이지가 새로 로드되지 않음 (SPA)
- 창을 좁히면 햄버거 메뉴 → 열고 → 항목을 누르면 자동으로 닫힘
- 주소창에 `/없는주소` → 404 화면, 상세 주소에서 새로고침해도 같은 화면

**관련 코드**
- `src/App.jsx` — 8개 라우트와 `path="*"`(Not Found)
- `src/components/layout/Header.jsx` — `NavLink`, `isMenuOpen` state
- `src/components/layout/Layout.jsx` — 주소가 바뀌면 맨 위 또는 `#contact`로 스크롤

**실행 흐름**: 메뉴 클릭 → React Router가 주소 변경 → `App.jsx`의 `Routes`가 맞는 페이지 선택 → `Layout`의 `Outlet` 자리에 그 페이지를 그림 → `Layout`의 useEffect(`[pathname, hash]`)가 스크롤 위치 조정

## 3. 언어·테마 변경 (A·B 모두)

**보여줄 것**
- **EN** → 모든 문구가 영어로, 버튼은 **KR**로 바뀜 → 새로고침해도 영어 유지
- **Dark** → 전체가 어두운 색으로 / **Auto ✓** → 운영체제 설정을 따름 → 새로고침해도 유지
- (선택) 운영체제를 다크 모드로 바꾸면 Auto 상태에서 바로 따라 바뀜

**관련 코드**
- `src/components/layout/DisplayControls.jsx` — 버튼 3개
- `src/contexts/ThemeContext.jsx` — `mode`(사용자 선택), `systemTheme`(운영체제), `theme`(실제 적용)
- `src/contexts/LanguageContext.jsx` + `src/lib/i18n.js` — `t()` = `translate()`
- `index.html` — React보다 먼저 저장된 테마를 적용해 깜빡임 방지

**실행 흐름**: Dark 클릭 → `toggleTheme()` → `mode` state 변경 → useEffect가 `<html data-theme="dark">` 적용 → CSS 변수(`[data-theme="dark"]`)가 색을 일괄 변경 → 또 다른 useEffect가 `localStorage`의 `portfolio-theme-mode`에 저장

## 4. 프로젝트 목록과 상세

### A. Supabase 연결 전
**보여줄 것**: Work 메뉴 → 잠깐 로딩 스피너 → "Supabase 연결 정보가 없습니다…" 안내와 **다시 시도** 버튼
**설명 포인트**: 설정이 빠졌을 때 앱이 멈추지 않고 원인을 알려 주며, 로딩·오류·빈 상태가 `DataStatus` 하나로 통일되어 있음

### B. Supabase 연결 후
**보여줄 것**
- 목록 카드, "n개의 프로젝트를 표시하고 있습니다."
- 분류 필터(예: 교육) → 카드와 개수가 바로 바뀜, 해당 분류가 없으면 "이 분류에 해당하는 프로젝트가 없습니다."
- 카드 클릭 → 상세 (역할·기간·기술·링크)
- 방문자에게는 등록·수정·삭제 버튼이 없음

**관련 코드**
- `src/pages/ProjectListPage.jsx` — `category` state, `useMemo`로 걸러낸 `visibleProjects`
- `src/hooks/useProjects.js` → `src/hooks/useAsyncData.js` → `src/lib/projectsApi.js`의 `fetchProjects()`
- `src/pages/ProjectDetailPage.jsx` → `useProject(id)` → `fetchProjectById(id)`
- `src/components/ui/DataStatus.jsx` — 로딩 → 오류 → 빈 데이터 → 내용

**실행 흐름**: 목록 화면 등장 → `useAsyncData`의 useEffect가 `fetchProjects()` 호출(15초 제한) → Supabase가 RLS로 "조회는 누구나" 허용 → `fromRow`로 변환 → state 저장 → 카드 그림. 필터 클릭 → `setCategory` → `useMemo` 재계산 → 목록만 다시 그림

## 5. 관리자 로그인

### A. Supabase 연결 전
**보여줄 것**: 푸터 **Admin** → 로그인 화면 / 주소창 `/projects/new` → 로그인 화면으로 이동(보호 라우트) / 빈 칸으로 로그인 → 칸별 오류 문구
(실제 로그인은 할 수 없고, 시도하면 "Supabase 연결 정보가 없습니다…" 안내가 나옵니다)

### B. Supabase 연결 후
**보여줄 것**
- 틀린 비밀번호 → "이메일 또는 비밀번호가 올바르지 않습니다."
- 올바른 관리자 계정 → "관리자로 로그인했습니다." 알림, 헤더에 **New·Logout** 등장
- `/projects/new`에서 로그인 화면으로 왔다면 로그인 후 원래 화면(등록)으로 돌아감

**관련 코드**
- `src/pages/LoginPage.jsx` — `validateLogin`, `signIn`, 원래 주소(`location.state.from`)로 이동
- `src/contexts/AuthContext.jsx` — 세션 확인 → `checkIsAdmin()`(DB 함수 `is_admin()`) → `isAdmin`
- `src/components/auth/ProtectedRoute.jsx` — 확인 중 / 방문자 / 관리자 아님 / 관리자 순서로 판단

**실행 흐름**: 로그인 버튼 → `validateLogin` 통과 → `signInWithPassword()` → Supabase Auth가 세션 발급 → `onAuthStateChange`가 `AuthContext`의 session 변경 → `checkIsAdmin()` → `isAdmin = true` → 헤더·버튼이 다시 그려짐 → `navigate(원래 주소)`

## 6. 프로젝트 등록·수정·삭제 (B만 가능 · 시험용 프로젝트로)

**보여줄 것**
1. **New** → 아무것도 입력하지 않고 등록하기 → 칸별 빨간 오류 + "입력값을 확인해 주세요." (요청은 보내지 않음)
2. 제목에 `시연용 프로젝트` 입력 → 오른쪽 **미리보기 카드**가 바로 바뀜, 한 줄 소개 글자 수(`0/120`) 증가
3. 이미지 주소에 `//example.com/a.png` → 형식 오류 (사이트 밖 주소 우회 차단)
4. 올바르게 채우고 등록 → 버튼이 "저장 중..."으로 비활성화 → 상세 화면 + "프로젝트를 등록했습니다."
5. (선택) Supabase **Table Editor → projects**에서 행이 생긴 것 확인 → 실제 저장 증명
6. **수정** → 제목 변경 → 저장 → "프로젝트를 수정했습니다."
7. **삭제** → 확인 창(Esc로 닫히는 것도 시연 가능) → 삭제 → 목록으로 이동 + "프로젝트를 삭제했습니다."

**관련 코드**
- `src/components/project/ProjectForm.jsx` — `values`·`errors` state, `validateProjectForm`, `toProjectInput`, 미리보기 `ProjectCard`
- `src/pages/ProjectCreatePage.jsx` — 화면이 열릴 때 `createProjectId()`로 새 id를 한 번 만들고 다시 저장할 때도 재사용
- `src/hooks/useProjectActions.js` — `isSubmitting`, 실행 중 추가 클릭 무시
- `src/lib/projectsApi.js` — `createProject`, `updateProject`, `deleteProject`
- `src/contexts/ToastContext.jsx` — 페이지를 옮겨도 남는 알림

**실행 흐름 (등록)**: 등록하기 → `validateProjectForm` 통과 → `create(input, projectId)` → `createProject` → `insert({ id, ...toRow(input) })` → Supabase RLS가 `is_admin()` 확인·CHECK 제약 검사 → 저장된 행 → `showToast` → `navigate('/projects/새id')`

> 시간 초과(15초) 안내가 뜨면 **같은 화면에서** 다시 저장하세요. 같은 id를 보내므로 중복으로 등록되지 않습니다.

## 7. 로그아웃 후 권한 차단 (B만 가능)

**보여줄 것**
- **Logout** → "로그아웃했습니다." → 목록으로 이동, 상세에서 수정·삭제 버튼이 사라짐
- 주소창에 `/projects/new` 직접 입력 → 로그인 화면으로 이동
- (선택) 관리자가 아닌 테스트 계정으로 로그인 → New 없음, `/projects/new` → "관리자 권한이 없는 계정입니다."
- (선택) Supabase SQL Editor에서 `supabase/05_verify_rls.sql` 실행 → 빨간 상자 안 "✅ RLS 점검 통과" (이 ERROR는 되돌리기 위한 정상 동작이며 실제 데이터는 바뀌지 않음)

**관련 코드**
- `src/components/layout/Header.jsx` — `handleLogout` → `signOut()`
- `src/components/auth/ProtectedRoute.jsx`
- `supabase/02_policies.sql` — 조회는 누구나, 등록·수정·삭제는 `is_admin()`일 때만

**설명 포인트**: 버튼을 숨기는 것은 화면 쪽 편의이고, 실제 차단은 DB의 RLS가 합니다. 개발자 도구로 API를 직접 불러도 DB가 거절합니다.

## 8. 자동 테스트로 보여주기 (A·B 모두)

```bash
npm test
```

**보여줄 것**: 마지막 줄 `Tests 191 passed` / `Test Files 22 passed`
**설명 포인트**: 실제 서버 대신 가짜 데이터로 등록·수정·삭제·로그인·권한 차단·연속 클릭·악성 입력까지 화면 흐름을 검증합니다. 대표 파일은 `src/pages/projectPages.test.jsx`, `src/pages/authFlow.test.jsx`, `src/pages/securityHardening.test.jsx`입니다.

---

## 오류가 발생했을 때 확인할 내용

먼저 **F12 → Console** 탭의 빨간 메시지를 확인합니다.

| 화면 증상 | 확인할 것 | 관련 파일 |
| --- | --- | --- |
| "Supabase 연결 정보가 없습니다" | `.env`가 프로젝트 최상위에 있는지, 변수 이름(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), `.env` 수정 후 `npm run dev` 재시작. 배포 사이트라면 Vercel 환경변수 후 Redeploy | `src/lib/supabaseClient.js` |
| "네트워크에 연결할 수 없습니다" | 인터넷 연결, Supabase 프로젝트가 일시정지(Paused)되지 않았는지 | `src/lib/errors.js` |
| "서버 응답이 너무 늦어…" | 잠시 후 같은 화면에서 다시 시도 (등록은 중복되지 않음) | `src/lib/request.js` |
| 로그인 시 "이메일 또는 비밀번호가 올바르지 않습니다" | Supabase Users의 이메일, Auto Confirm 여부 | `src/pages/LoginPage.jsx` |
| 로그인했는데 New가 없음 / "관리자 권한이 없는 계정" | `supabase/03_register_admin.sql`의 이메일, `02_policies.sql` 실행 여부(`is_admin` 함수) | `src/contexts/AuthContext.jsx` |
| 저장 시 "권한이 없습니다" / "변경되지 않았습니다" | 위와 같음 (RLS가 거절) | `supabase/02_policies.sql` |
| 이미지 주소 저장 오류 | `https://…` 전체 주소 또는 `/images/파일명`만 가능 | `src/lib/validators.js` |
| GitHub 카드 자리에 오류 | GitHub API 요청 한도(시간당 60회, IP 기준) 초과 가능 → 잠시 후 다시 시도 | `src/lib/githubApi.js` |
| 새로고침하면 404 (배포 사이트) | 배포한 브랜치에 `vercel.json`이 있는지 | `vercel.json` |
| 화면이 하얗게 비어 있음 | Console의 첫 번째 빨간 오류, `npm install` 다시 실행 | — |

## 5분 시연 시간 배분 예

| 시간 | 내용 |
| --- | --- |
| 0:00–0:40 | 홈 (타이핑·스크롤) |
| 0:40–1:20 | 메뉴 이동, 404, 모바일 메뉴 |
| 1:20–1:50 | 언어·테마 |
| 1:50–3:30 | (B) 로그인 → 등록 → 수정 → 삭제 / (A) 연결 정보 안내 + 보호 라우트 + 자동 테스트 |
| 3:30–4:20 | 로그아웃 후 차단, RLS 설명 |
| 4:20–5:00 | 기술설명서 HTML로 구조도·CRUD 흐름 한 장 보여주기 |
