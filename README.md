# Codyssey B1-2 | React 포트폴리오

B1-1 개인 포트폴리오(순수 HTML·CSS·JS)를 **React SPA**로 재구성하고, **Supabase**에 프로젝트를 등록·조회·수정·삭제할 수 있게 만든 서비스입니다.
기획자·교육전문가·AI 서비스 개발자·창업가로서의 프로젝트를 직접 관리할 수 있습니다. 방문자는 조회만, 관리자는 로그인 후 등록·수정·삭제할 수 있습니다.

- **B1-1 원본:** https://github.com/beatles12/codyssey-b1-1-portfolio (읽기 전용 참고)
- **이 저장소:** https://github.com/beatles12/codyssey-b1-2-react
- **배포 URL:** 아직 없음 (Vercel 배포 준비 완료, 승인 후 진행)

> 처음이라면 **[docs/START_HERE.md](docs/START_HERE.md)** 부터 읽어 주세요.

## 현재 상태

| 항목 | 상태 |
| --- | --- |
| 화면·라우팅·상태 관리·폼·인증 코드 | 구현 완료 |
| 자동 테스트 | 145개 통과 (Mock 데이터 기준) |
| 브라우저 실전 검증 | 46/46 통과 (가짜 API, PC·태블릿·모바일) |
| 실제 Supabase 연결 | ⏳ 사용자 설정 필요 → [docs/supabase-setup.md](docs/supabase-setup.md) |
| 배포 | ⏳ 승인 후 |

## 기술 스택

| 기술 | 역할 | 선택 이유 |
| --- | --- | --- |
| React 18 | 컴포넌트 기반 UI | 공식 요구사항, 상태 → 화면 자동 반영 |
| React Router 7 | SPA 라우팅 | 주소별 페이지, 보호 라우트 |
| Vite | 개발 서버·빌드 | 빠른 실행, 환경변수(`import.meta.env`) 지원 |
| Supabase | 원격 DB(PostgreSQL)·인증 | 서버 없이 CRUD, RLS로 권한 보호, 무료 시작 |
| Vitest + Testing Library | 자동 테스트 | 사용자처럼 화면을 클릭해 검증 |
| 순수 CSS (CSS 변수) | 스타일 | B1-1 디자인·다크 모드를 그대로 계승 |
| GitHub REST API · Formspree | 저장소 카드 · 문의 전송 | B1-1 기능 유지 |
| Vercel (예정) | 배포 | GitHub 연동, 환경변수 관리 |

## 실행 방법

```bash
npm install
```

```bash
npm run dev
```

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (http://localhost:5173) |
| `npm test` | 자동 테스트 |
| `npm run lint` | 코드 검사 |
| `npm run build` | 배포용 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 확인 |

Supabase 연결: `.env.example`을 복사해 `.env`를 만들고 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 채웁니다. `.env`는 GitHub에 올라가지 않습니다. 자세한 순서는 [docs/supabase-setup.md](docs/supabase-setup.md).

## 화면 (라우트 8개)

| 경로 | 화면 | 접근 |
| --- | --- | --- |
| `/` | Home: Hero → About → Expertise → Work → Contact | 누구나 |
| `/about` | 소개·네 가지 역할·GitHub 저장소 | 누구나 |
| `/projects` | 프로젝트 목록 + 분류 필터 | 누구나 |
| `/projects/:id` | 프로젝트 상세 (+ 관리자: 수정·삭제) | 누구나 |
| `/projects/new` | 프로젝트 등록 | 관리자 |
| `/projects/:id/edit` | 프로젝트 수정 | 관리자 |
| `/login` | 관리자 로그인 | 누구나 |
| `*` | Not Found | 누구나 |

## 주요 기능

- **CRUD**: Supabase `projects` 테이블 등록·조회·수정·삭제, 삭제 확인 창, 성공 알림
- **폼 UX**: 필수값·글자 수·URL 검사, 필드별 오류, 저장 중 버튼 비활성화, 실패 사유 표시, 실시간 미리보기 카드
- **상태 UI**: 로딩·오류(다시 시도)·빈 상태를 `DataStatus` 하나로 통일
- **관리자 인증**: Supabase Auth 로그인, `ProtectedRoute`, DB 함수 `is_admin()`으로 관리자만 관리 버튼 표시, **RLS로 DB에서 실제 차단**
- **B1-1 계승**: KR/EN 전환, Light/Dark/Auto 테마, 타이핑·등장 효과, GitHub API, 문의 폼, 반응형, 라벤더 디자인·시루 일러스트

## 폴더 구조

```text
src/
├── pages/          라우트 단위 화면 (8개)
├── components/
│   ├── ui/         재사용 UI 13개 (Button, FormField, DataStatus …)
│   ├── project/    ProjectCard, ProjectList, ProjectForm, ProjectDetail
│   ├── home/       홈·About 섹션
│   ├── layout/     헤더·푸터·공통 틀
│   └── auth/       ProtectedRoute
├── contexts/       전역 상태: 테마, 언어, 알림, 로그인
├── hooks/          커스텀 훅: useProjects, useProject, useProjectActions, useAsyncData …
├── lib/            Supabase·GitHub·Formspree 연결, 검사·변환·번역 함수
└── styles/         global / ui / home / project CSS
supabase/           직접 실행할 SQL (테이블, RLS, 관리자 등록, 예시 데이터, RLS 확인)
docs/               초보자용 기술 설명서
```

## 데이터 흐름

```text
주소 ─► pages ─► hooks (useProjects…) ─► lib (projectsApi) ─► Supabase (RLS 검사)
          │                                                     │
          └─► components (props) ◄────── data / isLoading / error ┘
                    │
        사용자 이벤트 ─► setState ─► 다시 렌더링
```

## 문서

| 문서 | 내용 |
| --- | --- |
| [START_HERE](docs/START_HERE.md) | 가장 먼저 확인할 것 |
| [OWNER_CHECKLIST](docs/OWNER_CHECKLIST.md) | 직접 해야 할 설정만 순서대로 (Windows 초보자용) |
| [00 개요](docs/00-overview.md) | B1-1과 차이, React 선택 이유, 구조도, 30초 설명 |
| [01 React 기초](docs/01-react-basics.md) | React vs JS, props / state / useEffect, Context, 커스텀 훅 |
| [02 구조](docs/02-structure.md) | 폴더·컴포넌트 역할, 함수 입력·반환·호출 관계 |
| [03 데이터 흐름](docs/03-data-flow.md) | 이벤트 → 상태 → 화면, CRUD·로그인 흐름, 30초 설명 |
| [04 실행·테스트](docs/04-run-and-test.md) | 실행 방법, 테스트 구성, 확인 체크리스트 |
| [05 요구사항](docs/05-requirements.md) | 공식 요구사항별 구현 위치·검증 여부·한계 |
| [Supabase 설정](docs/supabase-setup.md) | DB·관리자·RLS·Vercel 설정 순서 |
| [보안 검토](docs/security-review.md) | 관리자 권한·RLS 검토, 사용자별 직접 테스트 절차 |
| [보안 점검](docs/security-audit.md) | 의존성 경고, 비밀값 점검, 배포 전 체크리스트 |
