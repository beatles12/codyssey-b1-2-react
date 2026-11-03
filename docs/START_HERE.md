# START HERE — 아침에 가장 먼저 읽을 문서

밤사이 3~7단계를 모두 구현했습니다. 모든 작업은 `claude/epic-clarke-mmra67` 브랜치에만 있고, **main 생성·병합, 배포, Supabase 작업은 하지 않았습니다.**

## 1. 지금 상태 한눈에

| 항목 | 상태 |
| --- | --- |
| 3단계 테마·언어 | ✅ 완료 |
| 4단계 포트폴리오 화면 (B1-1 계승) | ✅ 완료 |
| 5단계 Supabase 연결 준비 (코드·SQL·안내서) | ✅ 완료 — **실제 DB 미연결** |
| 6단계 프로젝트 CRUD 화면 | ✅ 완료 — 가짜 데이터로만 검증 |
| 7단계 관리자 인증 코드 | ✅ 완료 — 가짜 로그인으로만 검증 |
| 자동 테스트 | 118개 통과 / 실패 0 |
| lint / build | 오류 0 / 성공 |
| 실제 Supabase·배포 | ⏳ 직접 설정 필요 |

## 2. 5분 안에 직접 보기 (Supabase 없이)

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

http://localhost:5173 에서 이 순서로 눌러 보세요.

1. **홈**: 제목 타이핑 → 아래로 스크롤 (About·Expertise 등장 효과) → Contact의 시루
2. 오른쪽 위 **EN** → 영어 / **Dark** → 다크 모드 / **Auto ✓** → 시스템 설정
3. 창을 좁혀 **햄버거 메뉴** 확인
4. **Work** 메뉴 → "Supabase 연결 정보가 없습니다…" 안내 (정상! 아직 DB가 없어서)
5. 푸터 **Admin** → 로그인 화면
6. 주소창에 `/projects/new` → 로그인 화면으로 이동 (보호 라우트)
7. 주소창에 `/없는주소` → 404 화면

## 3. 실제로 데이터가 저장되게 하려면 (약 20분)

[supabase-setup.md](supabase-setup.md)를 순서대로 따라 하세요. 요약:

1. supabase.com에서 프로젝트 만들기
2. SQL Editor에서 `supabase/01_schema.sql` → `02_policies.sql` 실행
3. Authentication에서 **회원가입 끄기**, 관리자 계정 만들기
4. `03_register_admin.sql`의 이메일을 바꿔 실행
5. Project Settings → API에서 URL과 **anon** 키를 `.env`에 넣기 (`service_role` 키는 절대 X)
6. `npm run dev` 다시 시작 → `/login` → 등록·수정·삭제 시험
7. `05_verify_rls.sql`로 방문자 삭제가 막히는지 확인

## 4. 문서 지도

| 문서 | 내용 |
| --- | --- |
| [01-react-basics.md](01-react-basics.md) | React vs 기존 JS, props / state / useEffect, Context, 커스텀 훅 |
| [02-structure.md](02-structure.md) | 폴더 구조, 컴포넌트 역할, 함수 입력·반환·호출 관계 |
| [03-data-flow.md](03-data-flow.md) | 클릭 → 상태 → 화면, CRUD·로그인 흐름, **30초 설명** |
| [04-run-and-test.md](04-run-and-test.md) | 실행·테스트 방법, 직접 확인 체크리스트 |
| [05-requirements.md](05-requirements.md) | 공식 요구사항별 구현 위치·검증 여부, **아직 검증 못 한 것**, 한계 |
| [supabase-setup.md](supabase-setup.md) | Supabase·관리자·RLS·Vercel 설정 순서 |
| [security-audit.md](security-audit.md) | 의존성 경고 기록, 배포 전 체크리스트 |

## 5. 결정이 필요한 것

1. **Supabase 설정** 진행 (위 3번) — 끝나면 알려 주세요. 실제 CRUD 검증을 함께 진행합니다.
2. **Vercel 배포** 승인 여부 — 배포 전 `security-audit.md` 체크리스트 확인 필요
3. **main 병합** 승인 여부 — 원격에 main 브랜치가 아직 없습니다
4. **코딩 가이드라인 파일** (`CODYSSEY_CODING_GUIDELINES.md`) 전달 — 받으면 전체 코드를 다시 점검합니다
5. **예시 데이터 내용** — `supabase/04_seed.sql`은 B1-1 설명만 옮겼습니다. 기획·교육·창업 프로젝트는 실제 경험으로 직접 등록하세요 (지어낸 경력은 넣지 않았습니다)

## 6. 알아 둘 점

- 로그인한 사람에게만 관리 버튼이 보이지만, **진짜 보안은 RLS**입니다. `02_policies.sql`을 꼭 실행하세요.
- 작업 환경에서 GitHub API가 요청 한도(403)에 걸려, About 페이지 GitHub 카드는 브라우저에서 **오류 화면만** 확인했습니다. 집 네트워크에서는 정상적으로 보일 가능성이 높습니다.
- 문의 폼은 실제 메일이 가므로 전송 시험을 하지 않았습니다.
