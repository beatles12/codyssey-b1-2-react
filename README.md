# Codyssey B1-2 | React 포트폴리오

B1-1 개인 포트폴리오(순수 HTML·CSS·JS)를 React SPA로 재구성하고, Supabase로 프로젝트를 등록·조회·수정·삭제할 수 있게 만드는 프로젝트입니다.

> 🚧 진행 중 — 현재 **1단계(기초 설정: 라우팅·공통 레이아웃)** 까지 구현되어 있습니다.

## 기술 스택

| 기술 | 역할 |
| --- | --- |
| React 18 | 컴포넌트 기반 UI |
| React Router 7 | SPA 라우팅 |
| Vite | 개발 서버·빌드 |
| Vitest + Testing Library | 자동 테스트 |
| Supabase | 원격 DB·인증 (예정) |
| Vercel | 배포 (예정) |

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 자동 테스트
npm run lint     # 코드 검사
npm run build    # 배포용 빌드
```

환경변수가 필요한 기능은 `.env.example`을 복사해 `.env`를 만든 뒤 값을 채웁니다. `.env`는 GitHub에 올라가지 않습니다.

## 라우트

| 경로 | 화면 |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/projects` | 프로젝트 목록 |
| `/projects/new` | 프로젝트 등록 |
| `/projects/:id` | 프로젝트 상세 |
| `/projects/:id/edit` | 프로젝트 수정 |
| `*` | Not Found |

## 폴더 구조

```text
src/
├── pages/        라우트 단위 화면
├── components/   재사용 UI 컴포넌트 (layout/ 은 헤더·푸터)
├── hooks/        커스텀 훅
├── lib/          외부 서비스 연결·유틸 함수
└── styles/       B1-1 디자인 토큰을 계승한 전역 스타일
```
