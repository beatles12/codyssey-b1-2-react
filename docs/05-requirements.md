# 05. 공식 B1-2 요구사항 충족 현황

검증 표시

- ✅ **자동 테스트로 확인** (Mock 데이터·가짜 응답, `npm test`)
- 🌐 **브라우저에서 확인** (Playwright로 실제 화면을 띄워 클릭. 프로젝트 데이터·로그인은 메모리 속 가짜 API 사용)
- ⏳ **아직 확인 못 함** — 실제 Supabase·Vercel 설정이 필요 (사용자가 직접 설정 후 확인)

> 실제 Supabase 원격 DB에 연결한 CRUD는 **아직 한 번도 실행되지 않았습니다.** 코드와 SQL은 준비되어 있고, 가짜 Supabase 응답으로 요청 모양만 검증했습니다.

## 1. 최종 결과물

| 요구사항 | 구현 위치 | 검증 |
| --- | --- | --- |
| 라우팅이 있는 SPA, 페이지 라우트 5개 이상 | `src/App.jsx` — 8개 (`/`, `/about`, `/projects`, `/projects/:id`, `/projects/new`, `/projects/:id/edit`, `/login`, `*`) | ✅ 🌐 |
| 핵심 데이터 CRUD (Supabase) | `src/lib/projectsApi.js`, `supabase/01_schema.sql` | ✅ 🌐(가짜 API) ⏳(실제 DB) |
| 목록·상세 페이지 | `ProjectListPage`, `ProjectDetailPage` | ✅ 🌐 |
| 폼: 유효성 검증 + 에러 표시 + 제출 중 상태 | `ProjectForm`, `lib/projectForm.js`, `Button isLoading` | ✅ 🌐 |
| 로딩/에러/빈 상태 일관 처리 | `components/ui/DataStatus.jsx` (홈 Work·목록·상세·수정·GitHub 공통) | ✅ 🌐 |
| 컴포넌트 단위 상태 분리 | 01-react-basics.md "상태를 어디에 두었나" | ✅ |
| 외부 접속 가능한 배포 URL | `vercel.json` 준비 | ⏳ 배포 안 함 (승인 필요) |
| GitHub 저장소 URL | https://github.com/beatles12/codyssey-b1-2-react (작업 브랜치 `claude/epic-clarke-mmra67`) | ✅ |
| README에 실행 방법·기술 스택 | `README.md` | ✅ |

## 2. 기능 요구사항

### 2-1. 프로젝트 기본 구성

| 요구사항 | 구현 | 검증 |
| --- | --- | --- |
| React 프로젝트 | React 18.3.1 + Vite | ✅ |
| pages / components / hooks·lib 분리 | `src/pages`, `src/components`, `src/hooks`, `src/lib` | ✅ |
| 공통 레이아웃(헤더/네비게이션) | `components/layout/Layout.jsx` (모든 라우트에 적용) | ✅ `App.test.jsx` |
| 단일 핵심 데이터 | `projects` 테이블 하나 | ✅ |

### 2-2. 라우팅

| 요구사항 | 구현 | 검증 |
| --- | --- | --- |
| 최소 5개 라우트 동작 | 8개 | ✅ 🌐 |
| 목록/상세 라우트 | `/projects`, `/projects/:id` | ✅ 🌐 |
| Not Found 페이지 | `path="*"` → `NotFoundPage` | ✅ 🌐 |
| 네비게이션 링크 | 헤더 About·Work·Contact, 로고(홈), 관리자 New, 푸터 Admin | ✅ 🌐 |

### 2-3. 컴포넌트 설계

| 요구사항 | 구현 | 검증 |
| --- | --- | --- |
| 재사용 컴포넌트 8개 이상 (prop으로 동작/표시 변화) | UI 13개 + 프로젝트 4개 (02-structure.md 표) | ✅ `ui.test.jsx` |
| 페이지/UI 컴포넌트 분리 | `pages/`는 데이터·상태, `components/`는 props로만 표시 | ✅ |
| 로딩/에러/빈 UI 공통 컴포넌트 | `LoadingState`, `ErrorState`, `EmptyState`, `DataStatus` | ✅ |

### 2-4. 상태 관리

| 요구사항 | 구현 | 검증 |
| --- | --- | --- |
| 폼 입력 상태 (controlled input) | `ProjectForm`, `ContactForm`, `LoginPage`의 `values` state | ✅ |
| 목록/상세 데이터 상태 | `useProjects`, `useProject` | ✅ `projectHooks.test.jsx` |
| 로딩/에러 상태 | `useAsyncData` (isLoading, error, reload) | ✅ |
| 커스텀 훅 1개 이상 | `useProjects`, `useProject(id)`, `useProjectActions`, `useAsyncData` 외 | ✅ |

### 2-5. CRUD (Supabase 원격 데이터 기준)

| 요구사항 | 구현 | 자동 테스트 | 브라우저(가짜 API) | 실제 Supabase |
| --- | --- | --- | --- | --- |
| 목록 조회 → 리스트 UI | `fetchProjects` → `ProjectList` | ✅ | 🌐 | ⏳ |
| 상세 조회 (라우트 파라미터) | `useParams` → `useProject(id)` | ✅ | 🌐 | ⏳ |
| 등록: 폼 → 제출 → 성공 시 이동 | 상세로 이동 + 알림 | ✅ | 🌐 | ⏳ |
| 수정: 폼 → 제출 → 성공 시 이동 | 상세로 이동 + 알림 | ✅ | 🌐 | ⏳ |
| 삭제: 삭제 후 목록 갱신·이동 | 확인 창 → 목록으로 이동 → 다시 조회 | ✅ | 🌐 | ⏳ |

### 2-6. 폼 UX

| 요구사항 | 구현 | 검증 |
| --- | --- | --- |
| 필수값 검증 (비면 제출 불가) | 제목·한 줄 소개·설명·분류 (공백만 입력도 거부) | ✅ 🌐 |
| 에러 메시지를 필드 근처·상단에 | 필드 아래 + 폼 위 "입력값을 확인해 주세요." | ✅ 🌐 |
| 제출 중 버튼 비활성화/진행 표시 | "저장 중...", `disabled`, `aria-busy` | ✅ 🌐 |
| 요청 실패 시 화면에 표시 | 권한(RLS)·네트워크·설정 누락·없는 프로젝트 각각 안내 | ✅ |

### 2-7. 이벤트 & 렌더링 (상태 변경 → 화면 변화 3곳 이상)

03-data-flow.md 표에 11곳 정리. 대표 3곳:

1. 필터 변경 → 목록 변경 (`ProjectListPage.jsx:20`)
2. 입력값 변경 → 미리보기 카드 변경 (`ProjectForm.jsx:21-23`)
3. 저장 성공 → 알림 표시 (`ProjectCreatePage.jsx:18`)

모두 ✅ 🌐

### 2-8. 배포

| 요구사항 | 상태 |
| --- | --- |
| 배포 URL에서 목록/상세, 등록/수정/삭제 동작 | ⏳ 배포하지 않음 |
| 환경변수 누락 없이 동작 | ⏳ Vercel 환경변수 등록은 사용자가 직접 (supabase-setup.md 10단계) |

## 3. 제약 사항

| 제약 | 준수 |
| --- | --- |
| React 18 이상 | ✅ 18.3.1 |
| Supabase 사용 | ✅ `@supabase/supabase-js` |
| 백엔드 서버 직접 구현하지 않음 | ✅ |
| `.env`에 키 보관, `.gitignore`에 `.env` 포함 | ✅ `.gitignore`, `.env.example`만 커밋 |
| API Key를 GitHub에 푸시하지 않음 | ✅ 코드에 Supabase 키 없음 (Formspree 공개 폼 ID만 B1-1과 동일하게 기본값) |
| 배포 대시보드에 환경변수 등록 | ⏳ 사용자가 직접 |

## 4. 보너스 과제

| 과제 | 구현 | 검증 |
| --- | --- | --- |
| 전역 상태(Context) | 테마·언어·알림·로그인 4개 | ✅ |
| 메모이제이션 | `useMemo`(필터·대표 프로젝트·Context 값), `useCallback`(훅 함수) | ✅ |
| 인증 + 보호 라우트 | Supabase Auth 로그인, `ProtectedRoute`, RLS SQL | ✅ 🌐(가짜 로그인) ⏳(실제 Auth·RLS) |

## 5. B1-1 기능 유지 비교

| B1-1 기능 | B1-2 | 검증 |
| --- | --- | --- |
| Hero / About / Expertise / Work / Contact | 홈에 같은 순서로 유지 | ✅ 🌐 |
| 한국어·영어 전환 (저장) | `LanguageContext` + 사전 | ✅ 🌐 |
| Light / Dark / Auto (저장, 시스템 감지) | `ThemeContext` | ✅ 🌐 |
| 반응형 (768px / 1024px) | B1-1 기준점 그대로, 375px 가로 넘침 없음 확인 | 🌐 |
| 제목 타이핑 효과 (B1-1 리듬) | `useTypingEffect` | ✅ 🌐 |
| 스크롤 등장 효과 | `RevealSection` + `useInView` | 🌐 |
| 움직임 줄이기 설정 존중 | CSS + 타이핑 생략 | 코드 반영, 수동 확인 필요 |
| GitHub API 연동 | About 페이지 `GithubSection` | ✅ / 🌐 오류 상태만 확인 (작업 환경에서 GitHub API 요청 한도 초과 403) |
| 프로젝트 필터 | 목록 분류 필터 (GitHub 언어 → 프로젝트 분류로 변경) | ✅ 🌐 |
| 문의 폼 (검사·Formspree) | `ContactForm` | ✅ (가짜 응답) / 실제 전송은 하지 않음 |
| 스크롤 시 헤더 배경, 맨 위로 버튼 | `useScrolled`, `BackToTopButton` | ✅ 🌐 |
| 시루 일러스트, 고양이 귀, 라벤더 색상 | 이미지·CSS 이식 | 🌐 |

## 6. 아직 검증하지 못한 기능

1. **실제 Supabase 원격 CRUD** — 프로젝트·키가 없어 실행하지 않음
2. **실제 Supabase Auth 로그인** — 관리자 계정 없음
3. **RLS 실제 차단** — SQL은 작성했지만 실행하지 않음. `05_verify_rls.sql`로 직접 확인 필요
4. **Vercel 배포 URL** — 배포하지 않음
5. **GitHub API 성공 화면 (브라우저)** — 작업 환경 IP의 요청 한도 초과로 오류 화면만 확인. 성공은 자동 테스트로만 확인
6. **문의 폼 실제 전송** — 실제 메일이 발송되므로 시도하지 않음
7. **실제 휴대폰·사파리** — 크롬 계열(Chromium)로만 확인

## 7. 기술적 한계와 개선 방향

| 한계 | 개선 방향 |
| --- | --- |
| 화면은 "로그인했는지"만 보고 관리 버튼을 보여줌 (관리자 여부는 RLS가 판단) | `is_admin()` RPC를 불러 관리자만 버튼 표시 |
| 프로젝트 내용(제목·설명)은 한 언어로만 저장 | `title_en` 등 영어 칸 추가 |
| 이미지는 URL로만 입력 | Supabase Storage 업로드 |
| 목록을 한 번에 모두 불러옴 | 많아지면 페이지 나누기(pagination) |
| 저장 후 목록을 다시 요청 (캐시 없음) | 필요해지면 TanStack Query 같은 캐시 도구 |
| GitHub API 요청 한도(시간당 60회, IP 기준) | 결과를 잠시 저장(localStorage 캐시) |
| ESLint 개발 의존성 경고 6건 (사이트에는 미포함) | 수정판이 나오면 업데이트 (`docs/security-audit.md`) |
| 코딩 가이드라인 원본 파일 미수령 | 받으면 전체 코드 재점검 |
