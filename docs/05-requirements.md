# 05. 공식 B1-2 요구사항 충족 현황

> 기준: B1-2 공식 미션 PDF의 "최종 결과물 · 기능 요구 사항 · 제약 사항 · 보너스 과제"를 현재 코드와 다시 비교했습니다.

## 분류 기준

| 분류 | 뜻 |
| --- | --- |
| **A. 구현 + 검증 완료** | 실제 서버가 필요 없는 기능. 자동 테스트와 실제 브라우저(Playwright) 화면 확인 모두 통과 |
| **B. 구현 완료, 실제 환경 검증 필요** | 코드·SQL은 준비됐고 가짜 API·로컬 모의 DB로 확인했지만, **실제 Supabase·Vercel에서는 아직 실행하지 않음** |
| **C. 미구현** | 해당 없음 |

> "브라우저 확인"은 실제 크롬(Chromium)으로 화면을 띄워 클릭한 것입니다. 단, 프로젝트 데이터와 로그인은 **메모리 속 가짜 API**를 사용했습니다.

## 요약

| 분류 | 개수 |
| --- | --- |
| A. 구현 + 검증 완료 | 22 |
| B. 실제 환경 검증 필요 | 6 |
| C. 미구현 | 0 |

**공식 요구사항 코드 구현률 100% / 실제 서비스 환경 검증률 약 79% (22/28)** — 남은 6개는 모두 Supabase·Vercel 실제 연결이 있어야 확인할 수 있는 항목입니다.

---

## A. 구현 + 검증 완료

### A1. 5개 이상의 라우트, 목록·상세 라우트, Not Found
- **기능**: 8개 주소(`/`, `/about`, `/projects`, `/projects/:id`, `/projects/new`, `/projects/:id/edit`, `/login`, `*`)
- **파일·컴포넌트**: `src/App.jsx`, `src/pages/*`, `NotFoundPage`
- **자동 테스트**: `src/App.test.jsx` "라우팅"
- **보여줄 화면**: 메뉴 클릭으로 이동 → 주소창에 `/없는주소` → 404
- **핵심 원리**: React Router가 주소를 보고 맞는 페이지 컴포넌트만 그립니다. 서버에서 새 HTML을 받지 않는 SPA라 화면이 깜빡이지 않습니다. `path="*"`는 앞의 어떤 주소와도 맞지 않을 때 선택됩니다.

### A2. 공통 레이아웃과 네비게이션
- **기능**: 모든 페이지에 헤더(메뉴·언어·테마)와 푸터, 주소 이동 시 맨 위로
- **파일**: `components/layout/Layout.jsx`, `Header.jsx`, `Footer.jsx`
- **테스트**: `App.test.jsx` "공통 헤더와 푸터", "네비게이션 링크"
- **화면**: 아무 페이지나 이동해도 헤더 유지
- **원리**: 부모 라우트 `<Route element={<Layout />}>` 안의 `<Outlet />` 자리에 자식 페이지가 들어갑니다.

### A3. pages / components / hooks / lib 역할 분리
- **파일**: `src/pages`, `src/components`, `src/hooks`, `src/lib`
- **테스트**: 계층별로 따로 테스트 (`lib/*.test.js`, `hooks/*.test.jsx`, `components/**/*.test.jsx`, `pages/*.test.jsx`)
- **원리**: 페이지는 "무엇을", 컴포넌트는 "어떻게 보이게", 훅은 "상태를 어떻게", lib는 "외부와 어떻게"를 맡습니다. 의존은 `pages → components/hooks → lib` 한 방향입니다.

### A4. 재사용 컴포넌트 8개 이상 (prop으로 동작·표시가 바뀜)
- **기능**: UI 13개 + 프로젝트 4개 = 17개 (02-structure.md 표)
- **대표**: `Button`(variant·isLoading), `FormField`(as·error), `DataStatus`, `FilterBar`, `ProjectCard`(목록·홈·GitHub·미리보기 4곳 재사용)
- **테스트**: `components/ui/ui.test.jsx`
- **원리**: 두 곳 이상에서 반복되는 모양을 함수로 만들고, 달라지는 부분만 props로 받습니다.

### A5. 페이지 컴포넌트와 UI 컴포넌트 분리
- **원리**: `pages/`는 훅을 부르고 상태를 가지며, `components/ui`는 Supabase나 라우터를 모르고 props만으로 그립니다. 그래서 UI 컴포넌트는 Provider 없이도 테스트됩니다(`ui.test.jsx`).

### A6. 로딩·에러·빈 상태를 공통 컴포넌트로 통일
- **파일·컴포넌트**: `components/ui/DataStatus.jsx` → `LoadingState` / `ErrorState` / `EmptyState`
- **사용처**: 홈 Work, 목록, 상세, 수정, GitHub (5곳 모두 같은 컴포넌트)
- **테스트**: `ui.test.jsx` "DataStatus", `projectPages.test.jsx`
- **화면**: 목록 첫 로딩 스피너 → 데이터 없음 문구 → 오류 + 다시 시도
- **원리**: `isLoading → error → isEmpty → children` 순서로 검사해 한 가지만 반환합니다.

### A7. 폼 입력 상태 (controlled input)
- **파일**: `ProjectForm.jsx`, `ContactForm.jsx`, `LoginPage.jsx`, `FormField.jsx`
- **테스트**: `ui.test.jsx` "FormField 입력값이 부모 state로 반영"
- **원리**: 입력칸의 `value`를 state가 쥐고, `onChange`에서 `setValues({...values, [name]: value})`로 새 객체를 만듭니다.

### A8. 목록·상세 데이터 상태, 로딩·에러 상태
- **파일·함수**: `hooks/useAsyncData.js`, `useProjects()`, `useProject(id)`
- **테스트**: `hooks/projectHooks.test.jsx`
- **원리**: useEffect에서 요청하고 결과를 state에 저장합니다. `isCurrent` 플래그로 늦게 도착한 이전 응답을 무시합니다.

### A9. 커스텀 훅으로 데이터 흐름 분리
- **훅**: `useProjects`, `useProject(id)`, `useProjectActions`, `useAsyncData`, `useGithubRepos`
- **테스트**: `projectHooks.test.jsx`
- **원리(분리 이유)**: 홈과 목록, 상세와 수정이 같은 불러오기 로직을 씁니다. 훅으로 모으면 페이지는 화면에만 집중하고, 로딩·오류·재시도·중복 클릭 방지를 한 곳에서 고칠 수 있습니다.

### A10. 필수값 검증 (비어 있으면 제출 불가)
- **함수**: `validateProjectForm()` (`lib/projectForm.js`)
- **규칙**: 제목·한 줄 소개·설명·분류 필수(공백만 입력도 거부), 제목 60자·소개 120자, URL 형식
- **테스트**: `projectForm.test.js`, `projectPages.test.jsx` "필수값이 비면"
- **브라우저**: 잘못된 입력 5종 → 오류 5개, 저장 요청 0회 확인
- **원리**: 제출 시 검사 결과가 비어 있지 않으면 `onSubmit`을 부르지 않고 `errors` state만 바꿉니다.

### A11. 에러 메시지를 필드 근처·상단에 표시
- **컴포넌트**: `FormField`의 `error`(필드 아래, `aria-describedby`로 연결), `ProjectForm` 상단 안내
- **테스트**: `projectPages.test.jsx`

### A12. 제출 중 상태 표시
- **함수·컴포넌트**: `useProjectActions().isSubmitting` → `Button isLoading` ("저장 중...", 비활성화)
- **추가 보호**: 실행 중 잠금으로 더블클릭해도 1번만 요청. 시간 초과 뒤 다시 저장해도 같은 id를 보내 중복 등록이 생기지 않음
- **테스트**: `projectPages.test.jsx` "저장 중에는", `securityHardening.test.jsx` "연속 클릭 방지"

### A13. 요청 실패를 화면에 표시
- **함수**: `toErrorKey()` (`lib/errors.js`) → 설정 누락·권한(RLS)·없는 데이터·네트워크·시간 초과·변경 없음 문구
- **테스트**: `errors.test.js`, `projectPages.test.jsx` "저장에 실패하면", "삭제가 거절되면"

### A14. 이벤트 → 상태 → 렌더링 흐름, 상태 변화 3곳 이상
- **대표 3곳**: 필터 → 목록(`ProjectListPage`), 입력 → 미리보기(`ProjectForm`), 저장 성공 → 알림(`ToastContext`)
- **전체 11곳**: 03-data-flow.md 표
- **테스트**: `projectPages.test.jsx` "필터를 바꾸면", "미리보기 카드", "등록했습니다"
- **원리**: 이벤트 핸들러가 `setState`를 부르면 React가 그 컴포넌트를 다시 실행하고 바뀐 부분만 화면에 반영합니다.

### A15. 서비스 주제와 단일 핵심 데이터
- **기능**: 개인 포트폴리오 프로젝트(`projects` 테이블 하나)

### A16. React 18 이상
- `package.json`: `react@18.3.1`

### A17. 백엔드 서버를 직접 만들지 않음
- Supabase가 API·DB·인증을 제공, 이 저장소에는 서버 코드 없음

### A18. `.env` 사용, `.gitignore`에 포함, 키를 GitHub에 올리지 않음
- **파일**: `.gitignore`, `.env.example`, `lib/supabaseClient.js`(`import.meta.env`)
- **검증**: 전체 커밋 기록 비밀값 검사 통과 (security-review.md 6장)

### A19. README에 실행 방법·기술 스택
- `README.md`

### A20. 보너스: 전역 상태(Context)
- 테마·언어·알림·로그인 4개 (`src/contexts`), 테스트 `displaySettings.test.jsx`, `authFlow.test.jsx`

### A21. 보너스: 메모이제이션
- `useMemo`(필터 결과, 대표 프로젝트, Context 값), `useCallback`(훅 함수, `useProject`의 불러오기 함수)

### A22. 보너스: 보호 라우트 (화면 쪽)
- `ProtectedRoute` — 방문자 → 로그인, 관리자 아님 → 권한 없음
- 테스트 `authFlow.test.jsx`, `securityHardening.test.jsx`, 브라우저(가짜 로그인) 확인

---

## B. 구현 완료, 실제 환경 검증 필요

| # | 요구사항 | 준비된 것 | 지금까지 확인 | 남은 확인 (사용자) |
| --- | --- | --- | --- | --- |
| B1 | Supabase 원격 데이터 기준 **목록·상세 조회** | `projectsApi.fetchProjects/fetchProjectById`, `01_schema.sql` | 가짜 Supabase 응답 테스트, SQL 로컬 모의 실행 | OWNER_CHECKLIST 5-2 |
| B2 | 원격 **등록·수정** (폼 → 제출 → 이동) | `createProject/updateProject` | 가짜 API 브라우저 확인 | OWNER_CHECKLIST 5-3 (4~7) |
| B3 | 원격 **삭제** → 목록 갱신 | `deleteProject` | 가짜 API 브라우저 확인 | OWNER_CHECKLIST 5-3 (8~9) |
| B4 | 보너스: **Supabase Auth 로그인** + RLS 권한 | `authApi`, `02_policies.sql`, `05_verify_rls.sql` | 가짜 로그인 브라우저 확인, RLS 로컬 모의 실행(안전·위험 설정 모두) | OWNER_CHECKLIST 3·5-1 |
| B5 | **외부 접속 가능한 배포 URL** | `vercel.json`, 빌드 성공 | 로컬 빌드·미리보기 | OWNER_CHECKLIST 6 |
| B6 | **배포 URL에서 CRUD 모두 동작** (환경변수 누락 없음) | 환경변수 안내 | — | OWNER_CHECKLIST 6-7 |

- **보여줄 화면(연결 후)**: 관리자 로그인 → 등록 → Supabase Table Editor에 행이 생긴 것 → 수정 → 삭제 → 로그아웃 후 버튼 사라짐
- **핵심 원리**: 브라우저는 `anon` 키로 Supabase REST API를 부르고, 로그인하면 사용자 토큰이 함께 갑니다. DB는 RLS 정책으로 요청마다 `is_admin()`을 검사해 쓰기를 허락하거나 거절합니다.

## C. 미구현

없음. (공식 요구사항에 없는 기능은 추가하지 않았습니다.)

---

## 기술적 한계와 개선 방향

| 한계 | 개선 방향 |
| --- | --- |
| 프로젝트 내용은 한 언어로만 저장 (화면 문구만 KR/EN) | `title_en` 등 영어 칸 추가 |
| 이미지는 URL 입력만 | Supabase Storage 업로드 |
| 목록을 한 번에 모두 조회, 캐시 없음 | 데이터가 많아지면 페이지 나누기·캐시 도구 |
| 시간 초과 후에도 실제 요청은 계속될 수 있음 (등록은 id 재사용으로 중복 방지, 단 등록 화면을 새로 열면 새 id) | 요청 취소(AbortController) 연결 |
| GitHub API는 IP당 시간당 60회 제한 | 결과를 잠시 저장 |
| ESLint 개발 의존성 경고 6건(사이트 미포함) | 수정판이 나오면 업데이트 |
| 코딩 가이드라인 원본 미수령 | 받으면 전체 재점검 |
