# START HERE — 가장 먼저 읽을 문서

## 1. 지금 상태 (정확히)

> **코드 구현·자동 테스트가 끝났고, 실제 Supabase 연동(CRUD·관리자 인증·RLS)과 Vercel 배포까지 소유자가 검증했습니다.** 배포 URL: https://codyssey-b1-2-react-three.vercel.app

| 항목 | 상태 |
| --- | --- |
| 공식 요구사항 코드 구현 | ✅ 전부 구현 (미구현 0) |
| 자동 테스트 | ✅ 191개 통과 / 실패 0 (가짜 API) |
| 브라우저 실전 검증 | ✅ 46/46 통과 (가짜 API, PC·태블릿·모바일) |
| SQL 파일 | ✅ 로컬 모의 환경 검증 + ✅ 실제 Supabase 적용·RLS 확인 (소유자) |
| 실제 Supabase CRUD·로그인·RLS | ✅ 검증 완료 (소유자) |
| Vercel 배포 | ✅ https://codyssey-b1-2-react-three.vercel.app |
| main 브랜치 | 없음 (작업은 `claude/epic-clarke-mmra67` 브랜치에만 있음) |

## 2. 오늘 할 일 (순서대로)

1. **5분 둘러보기** (아래 3번) — Supabase 없이도 대부분의 화면을 볼 수 있습니다
2. **[OWNER_CHECKLIST.md](OWNER_CHECKLIST.md)** 따라 하기 — Supabase 설정 → SQL → 관리자 → `.env` → 실제 테스트 → 배포
3. 결과(특히 `05_verify_rls.sql`의 ERROR 상자 내용)를 Claude에게 알려 주기

## 3. 5분 둘러보기 (Supabase 없이)

```bash
git checkout claude/epic-clarke-mmra67
```

```bash
git pull origin claude/epic-clarke-mmra67
```

```bash
npm install
```

```bash
npm run dev
```

http://localhost:5173 에서

1. **홈**: 제목 타이핑 → 스크롤(등장 효과) → Contact의 시루
2. 오른쪽 위 **EN** / **Dark** / **Auto ✓**
3. 창을 좁혀 **햄버거 메뉴**
4. **Work** → "Supabase 연결 정보가 없습니다…" (정상! DB가 아직 없음)
5. 푸터 **Admin** → 로그인 화면 / 주소창 `/projects/new` → 로그인 화면으로 이동
6. 주소창 `/없는주소` → 404

## 4. 공부 순서

| 순서 | 문서 | 이런 질문에 답합니다 |
| --- | --- | --- |
| ★ | [B1-2_program_guide.html](B1-2_program_guide.html) | **시각 자료 한 파일**: 구조도, 함수 사전(입력·반환·호출 관계), 클릭→화면·CRUD 흐름도, 테스트, 구현 상태. 파일을 더블클릭해 브라우저로 엽니다 |
| 1 | [00-overview.md](00-overview.md) | B1-1과 뭐가 달라요? 왜 React? 전체 구조도, 페이지별 컴포넌트, **30초 설명** |
| 2 | [01-react-basics.md](01-react-basics.md) | props / state / useEffect / Context / 커스텀 훅이 이 코드 어디에 있나요? |
| 3 | [02-structure.md](02-structure.md) | 폴더·컴포넌트 역할, 함수의 입력·반환·호출 관계 |
| 4 | [03-data-flow.md](03-data-flow.md) | 클릭 → 함수 → 상태 → 화면, 등록·조회·수정·삭제·로그인 흐름도 |
| 5 | [04-run-and-test.md](04-run-and-test.md) | 실행·테스트 방법, 테스트가 무엇을 검증하나요? |
| 6 | [05-requirements.md](05-requirements.md) | 공식 요구사항별 구현 위치·테스트·보여줄 화면·핵심 원리 |
| 7 | [security-review.md](security-review.md) | 관리자 권한은 어떻게 지켜지나요? RLS 검토와 직접 테스트 절차 |

시연용: [DEMO_GUIDE.md](DEMO_GUIDE.md)(발표 순서·화면별 코드·오류 확인)

배포용: [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)(실제 DB 검증 → Vercel 설정 → 배포 후 확인)

설정용 문서: [OWNER_CHECKLIST.md](OWNER_CHECKLIST.md)(직접 할 일), [supabase-setup.md](supabase-setup.md)(자세한 설명·문제 해결), [security-audit.md](security-audit.md)(의존성·배포 전 체크리스트)

## 5. 핵심 한 장

```text
사용자 클릭 ─► 이벤트 함수 ─► setState / 훅 ─► React가 다시 그림
                                  │
                       lib/projectsApi.js ─► Supabase (RLS가 관리자만 쓰기 허용)
```

- 페이지(`pages/`)는 훅으로 데이터를 받고, 재사용 컴포넌트(`components/`)에 props로 넘깁니다.
- 로딩·오류·빈 상태는 `DataStatus` 하나로 통일했습니다.
- 관리 버튼 숨김은 편의 기능이고, **진짜 보안은 DB의 RLS**입니다.

## 6. 결정이 필요한 것

1. Supabase 설정 진행 → 끝나면 실제 CRUD·RLS 결과를 함께 확인
2. Vercel 배포 승인 여부
3. main 병합 승인 여부 (PR로 진행 권장)
4. `CODYSSEY_CODING_GUIDELINES.md` 전달 (아직 받지 못함)
5. 예시 데이터(`04_seed.sql`)는 B1-1 설명만 옮겼습니다. 기획·교육·창업 프로젝트는 실제 경험으로 직접 등록해 주세요.
