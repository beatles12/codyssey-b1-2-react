# 02. 전체 구조 — 폴더, 컴포넌트, 함수

## 1. 폴더 구조

```text
codyssey-b1-2-react/
├── index.html                 # HTML은 이 파일 하나 (SPA). 첫 화면 테마 깜빡임 방지 스크립트 포함
├── public/images/             # B1-1에서 가져온 이미지 (Hero 고양이 귀, About 그림, 프로젝트 캡처)
├── supabase/                  # 직접 실행할 SQL (테이블, RLS, 관리자 등록, 예시 데이터, 확인용)
├── docs/                      # 설명서 (지금 읽는 문서)
├── src/
│   ├── main.jsx               # 시작점: BrowserRouter + AppProviders + App
│   ├── App.jsx                # 라우트 표 (주소 ↔ 페이지)
│   ├── AppProviders.jsx       # 전역 Context 묶음
│   ├── pages/                 # 라우트 단위 화면 (데이터를 가져오고 상태를 가짐)
│   ├── components/
│   │   ├── ui/                # 어디서나 쓰는 재사용 UI (데이터를 모름, props로만 동작)
│   │   ├── layout/            # 헤더·푸터·공통 틀
│   │   ├── home/              # 홈·About 섹션
│   │   ├── project/           # 프로젝트 카드·목록·폼·상세
│   │   └── auth/              # ProtectedRoute
│   ├── contexts/              # 전역 상태 (테마, 언어, 알림, 로그인)
│   ├── hooks/                 # 커스텀 훅
│   ├── lib/                   # React와 무관한 순수 함수·외부 서비스 연결
│   ├── styles/                # global / ui / home / project CSS
│   └── test/                  # 테스트 도우미 (Mock 데이터, 브라우저 기능 흉내)
├── vite.config.js             # 개발 서버·빌드·테스트 설정
├── vercel.json                # 배포 시 새로고침해도 404가 나지 않게 하는 설정
└── .env.example               # 환경변수 예시 (.env는 GitHub에 올리지 않음)
```

### 이 구조를 선택한 이유

- **pages**: "이 주소에서 무엇을 보여줄까"를 결정. 훅으로 데이터를 받아 UI 컴포넌트에 props로 넘깁니다.
- **components**: "어떻게 생겼나"만 담당. 데이터가 어디서 왔는지 모릅니다 → 다른 곳에서 재사용 가능.
- **hooks**: "상태를 어떻게 관리할까". 여러 페이지가 같은 로직을 공유.
- **lib**: React 없이도 동작하는 함수(검사, 변환, API 호출). 가장 테스트하기 쉬움.

한 방향으로만 의존합니다: `pages → components / hooks → lib`. lib는 React를 모르고, ui 컴포넌트는 Supabase를 모릅니다.

## 2. 라우트 (8개)

| 경로 | 페이지 | 접근 | 하는 일 |
| --- | --- | --- | --- |
| `/` | `HomePage` | 누구나 | Hero → About → Expertise → Work(대표 프로젝트) → Contact |
| `/about` | `AboutPage` | 누구나 | 소개, 네 가지 역할, GitHub 저장소 |
| `/projects` | `ProjectListPage` | 누구나 | 목록, 분류 필터 |
| `/projects/:id` | `ProjectDetailPage` | 누구나 (수정·삭제 버튼은 로그인 시) | 상세, 삭제 |
| `/projects/new` | `ProjectCreatePage` | 로그인 필요 | 등록 폼 |
| `/projects/:id/edit` | `ProjectEditPage` | 로그인 필요 | 수정 폼 |
| `/login` | `LoginPage` | 누구나 | 관리자 로그인 |
| `*` | `NotFoundPage` | 누구나 | 잘못된 주소 |

## 3. 컴포넌트 역할

### 재사용 UI (`components/ui`) — 13개

| 컴포넌트 | 주요 props | 역할 | 쓰는 곳 |
| --- | --- | --- | --- |
| `Button` | variant, to, href, icon, isLoading, loadingText, onClick | 버튼·내부 링크·외부 링크 공통 모양, 제출 중 비활성화 | 거의 모든 페이지 |
| `FormField` | label, name, value, onChange, error, as, options, hint, required | 라벨+입력칸+오류 문구 | 프로젝트 폼, 문의 폼, 로그인 |
| `LoadingState` | message | 스피너 | DataStatus, ProtectedRoute |
| `ErrorState` | message, onRetry | 오류 + 다시 시도 | DataStatus |
| `EmptyState` | message, action | 빈 데이터 안내 | DataStatus, 목록(필터 결과 없음) |
| `DataStatus` | isLoading, error, isEmpty, onRetry, …, children | 로딩/오류/빈/성공 중 하나 선택 | 홈 Work, 목록, 상세, 수정, GitHub |
| `FilterBar` | options, value, onChange, label | 필터 버튼 묶음 | 목록 |
| `TagList` | tags | 기술 태그 | 카드, 상세 |
| `Toast` | message, type, onClose, duration | 잠깐 뜨는 알림 | ToastContext |
| `ConfirmDialog` | open, title, message, isLoading, onConfirm, onCancel | 삭제 확인 창 | 상세 |
| `SectionHeading` | eyebrow, title, number, description, as, isTyping | B1-1 섹션 제목 | 모든 페이지 |
| `TypingHeading` | text, as, startDelay | 타이핑 제목 | Hero, 섹션 제목, Contact |
| `RevealSection` | id, className, children | 스크롤 등장 효과 섹션 | 홈·About 섹션 |

### 프로젝트 (`components/project`)

| 컴포넌트 | props | 역할 |
| --- | --- | --- |
| `ProjectCard` | project, index, label, href, isExternal, linkLabel | B1-1 Work 카드. 목록·홈·GitHub·미리보기 4곳에서 재사용 |
| `ProjectList` | projects | 카드 격자. 카드 클릭 → 상세 |
| `ProjectForm` | initialValues, submitLabel, onSubmit, isSubmitting, serverError, cancelTo | 등록·수정 공통 폼 + 실시간 미리보기 |
| `ProjectDetail` | project, actions | 상세 본문. 관리자일 때만 actions(수정·삭제) 전달 |

### 홈 (`components/home`)

`HeroSection`, `AboutSection`(number, headingAs), `ExpertiseSection`(number), `WorkSection`(number, children), `FeaturedProjects`, `GithubSection`, `ContactSection`(number), `ContactForm`

### 레이아웃·인증

`Layout`(공통 틀, 주소 변경 시 스크롤), `Header`(메뉴·관리자 메뉴), `DisplayControls`(KR/EN·Auto·Dark), `Footer`, `BackToTopButton`, `ProtectedRoute`

## 4. 주요 함수: 입력값 · 반환값 · 호출 관계

### lib/projectsApi.js (Supabase CRUD)

| 함수 | 입력 | 반환 | 실패 시 |
| --- | --- | --- | --- |
| `fetchProjects()` | 없음 | `Promise<Project[]>` (최신순) | Supabase 오류 / `config` |
| `fetchProjectById(id)` | id (uuid 문자열) | `Promise<Project>` | 없으면 `notFound` |
| `createProject(project)` | 저장용 프로젝트 객체 | `Promise<Project>` (id 포함) | RLS 거절 시 `42501` |
| `updateProject(id, project)` | id, 저장용 객체 | `Promise<Project>` | 바뀐 행 0개면 `notChanged` |
| `deleteProject(id)` | id | `Promise<void>` | 지운 행 0개면 `notChanged` |
| `fromRow(row)` / `toRow(project)` | DB 행 / 화면 객체 | 서로 변환 | — |

> 왜 `notChanged`가 필요한가요? Supabase는 RLS가 **수정·삭제**를 막으면 오류 대신 "0개 바뀜"으로 응답합니다. 그래서 0개면 직접 오류로 바꿔 사용자에게 알립니다.

### lib/projectForm.js (폼 ↔ 데이터)

| 함수 | 입력 | 반환 |
| --- | --- | --- |
| `validateProjectForm(values)` | 폼 값 | `{ title: "validation.titleRequired", … }` (오류 없으면 `{}`) |
| `toProjectInput(values)` | 폼 값 | 공백 제거 + 기술 스택 배열로 바꾼 저장용 객체 |
| `toFormValues(project)` | 저장된 프로젝트 | 수정 폼 초기값 (기술 스택은 `"React, Supabase"` 문자열) |
| `parseTechStack(text)` | `" React, ,Vite "` | `["React", "Vite"]` |

### lib 기타

| 함수 | 입력 → 반환 | 비고 |
| --- | --- | --- |
| `getSupabase()` | → Supabase 클라이언트 | `.env`가 없으면 `AppError("config")` |
| `toErrorKey(error)` | 오류 → `"errors.notFound"` 등 | 화면은 `t(key)`로 번역해 표시 |
| `translate(lang, key, params)` | `("ko", "projects.count", {count: 3})` → `"3개의 프로젝트를…"` | `t()`의 실제 구현 |
| `validateContact / validateLogin` | 폼 값 → 오류 객체 | |
| `fetchGithubRepos()` | → 카드 모양 저장소 4개 | 선호 저장소 우선, 포크 제외 |
| `sendContactMessage(values)` | → `Promise<void>` | Formspree 전송 |
| `getSession / onAuthStateChange / signInWithPassword / signOut` | Supabase Auth 감싸기 | 미설정이면 방문자로 동작 |

### 호출 관계 (등록 예시)

```text
ProjectCreatePage
 ├─ useProjectActions() ──► create(input) ──► projectsApi.createProject() ──► toRow() ──► Supabase insert
 └─ <ProjectForm onSubmit={handleSubmit}>
      ├─ validateProjectForm(values)
      ├─ toProjectInput(values) ──► onSubmit(input)   (= handleSubmit)
      └─ <ProjectCard project={preview}>  (미리보기)
```

## 5. 스타일

| 파일 | 내용 |
| --- | --- |
| `global.css` | B1-1 색상 변수(라이트/다크), 헤더, 푸터, 섹션 제목, 맨 위로 버튼 |
| `ui.css` | 버튼, 폼, 로딩/오류/빈 상태, 필터, 태그, 알림, 확인 창 |
| `home.css` | Hero 카드·고양이 귀, About, Expertise, Contact(시루), 등장 효과 |
| `project.css` | 카드, 목록, 상세, 등록·수정 폼, 로그인 |

색은 모두 `var(--lavender-deep)` 같은 CSS 변수를 씁니다. `[data-theme="dark"]`일 때 변수 값만 바뀌므로 다크 모드가 한 번에 적용됩니다.
