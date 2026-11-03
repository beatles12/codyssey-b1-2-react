# 00. 한눈에 보는 B1-2 — 무엇을, 왜, 어떻게

## 1. B1-1과 B1-2의 차이

| | B1-1 | B1-2 |
| --- | --- | --- |
| 형태 | 한 페이지짜리 소개 사이트 | 여러 화면이 있는 웹 서비스(SPA) |
| 기술 | HTML·CSS·JavaScript | React + React Router + Supabase |
| 프로젝트 데이터 | GitHub에서 읽기만 | 직접 **등록·조회·수정·삭제** (Supabase DB 저장) |
| 화면 이동 | `#about` 같은 같은 페이지 스크롤 | `/projects/123` 같은 실제 주소, 새로고침 없이 전환 |
| 사용자 | 모두 방문자 | 방문자(조회) / 관리자(로그인 후 관리) |
| 화면 변경 방식 | DOM을 직접 찾아 고침 | state를 바꾸면 React가 다시 그림 |
| 유지한 것 | — | 디자인(라벤더·시루), KR/EN, 테마, 타이핑, 등장 효과, GitHub 카드, 문의 폼, 반응형 |

## 2. React를 사용한 이유

1. **화면이 데이터에 따라 자주 바뀐다** — 목록·필터·폼·로딩·오류가 서로 얽혀 있어, DOM을 직접 고치면 실수가 많아집니다. React는 "상태가 이러면 화면은 이렇다"만 적으면 됩니다.
2. **같은 모양이 반복된다** — 카드·버튼·입력칸·상태 화면을 컴포넌트로 만들어 여러 곳에서 씁니다.
3. **화면이 여러 개다** — React Router로 주소별 페이지와 로그인 보호를 쉽게 만듭니다.
4. **공식 미션 요구사항** — React 18 이상 SPA.

## 3. 전체 구조도

```text
                         ┌──────────── 브라우저 (React SPA) ────────────┐
 사용자 ── 클릭·입력 ──►  │  App (라우터)                                 │
                         │   └ Layout (Header · Footer)                  │
                         │       └ pages  ──► hooks ──► lib ──────────────┼──► Supabase
                         │            │       (상태)    (API 함수)         │     ├ Auth (로그인)
                         │            └──► components (props로 표시)      │     └ DB + RLS (권한)
                         │  contexts: 테마 · 언어 · 알림 · 로그인          │
                         └───────────────────────────────────────────────┘──► GitHub API / Formspree
```

## 4. 페이지별 컴포넌트 구성

```text
HomePage  "/"
├ HeroSection ── TypingHeading, Button
├ AboutSection ── RevealSection, SectionHeading
├ ExpertiseSection ── RevealSection, SectionHeading
├ WorkSection ── FeaturedProjects ── DataStatus ── ProjectList ── ProjectCard ×4
└ ContactSection ── ContactForm ── FormField ×3, Button

AboutPage  "/about"
├ AboutSection
├ (역할 카드 4개)
└ GithubSection ── DataStatus ── ProjectCard (외부 링크)

ProjectListPage  "/projects"
├ SectionHeading
└ DataStatus
   ├ FilterBar (분류)
   ├ Button "새 프로젝트 등록" (관리자만)
   └ ProjectList ── ProjectCard / EmptyState (필터 결과 없음)

ProjectDetailPage  "/projects/:id"
├ Button "목록으로"
├ DataStatus ── ProjectDetail ── TagList, Button(GitHub·Demo)
│                └ actions: Button "수정", Button "삭제" (관리자만)
└ ConfirmDialog (삭제 확인)

ProjectCreatePage "/projects/new" · ProjectEditPage "/projects/:id/edit"   (ProtectedRoute 안)
└ ProjectForm ── FormField ×9, Button ×2, ProjectCard(미리보기)

LoginPage "/login" ── FormField ×2, Button
NotFoundPage "*"   ── SectionHeading, Button ×2
```

## 5. 일반적인 기술 설명 (발표·README용)

> 이 프로젝트는 React 18과 Vite로 만든 단일 페이지 애플리케이션입니다. React Router로 8개의 화면 경로를 구성했고, 프로젝트 데이터는 Supabase(PostgreSQL)에 저장합니다.
> 데이터 요청은 `lib/projectsApi.js`에 모으고, `useProjects`·`useProject`·`useProjectActions` 커스텀 훅이 로딩·오류·제출 상태를 관리합니다. 화면은 재사용 UI 컴포넌트에 props를 넘겨 그리며, 로딩·오류·빈 상태는 `DataStatus` 하나로 통일했습니다.
> 테마·언어·알림·로그인은 Context로 전역 관리합니다. 관리자 권한은 화면에서 버튼을 숨기는 것과 별개로, Supabase Row Level Security 정책이 DB 단계에서 관리자만 쓰기를 허용하도록 설계했습니다.
> Vitest와 Testing Library로 171개의 자동 테스트를 작성했으며, 실제 서버 대신 가짜 응답을 사용해 화면 흐름을 검증합니다.

## 6. 30초 핵심 설명

> "B1-1 포트폴리오를 React SPA로 바꿔서, 프로젝트를 직접 등록·수정·삭제할 수 있게 만들었어요. 주소마다 페이지가 있고, 페이지는 커스텀 훅으로 Supabase 데이터를 받아 재사용 컴포넌트에 props로 넘겨요. 로딩·오류·빈 화면은 컴포넌트 하나로 통일했고, 폼은 입력 검사와 실시간 미리보기를 해요. 관리자만 수정할 수 있는데, 진짜 보안은 화면이 아니라 DB의 RLS 정책이 맡아요."

## 다음에 읽을 문서

- 개념 → [01-react-basics.md](01-react-basics.md)
- 구조·함수 → [02-structure.md](02-structure.md)
- 흐름도 → [03-data-flow.md](03-data-flow.md)
