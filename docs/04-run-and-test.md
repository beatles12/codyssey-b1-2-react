# 04. 직접 실행하고 테스트하기

## 1. 준비

- Node.js 20 이상 (`node -v`로 확인. 개발 시 22 버전 사용)
- 터미널(맥: 터미널 앱, 윈도우: PowerShell) 또는 VS Code 터미널

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

## 2. 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 을 엽니다. 끌 때는 터미널에서 `Ctrl + C`.

`.env` 없이 실행하면 홈·About·문의·테마·언어는 동작하고, 프로젝트 목록 자리에 "Supabase 연결 정보가 없습니다…" 안내가 나옵니다. 연결 방법은 [supabase-setup.md](supabase-setup.md).

## 3. 명령어

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 (저장하면 화면 자동 갱신) |
| `npm test` | 자동 테스트 1회 실행 |
| `npm run test:watch` | 파일을 저장할 때마다 테스트 다시 실행 |
| `npm run lint` | 코드 규칙 검사 (훅 사용 규칙 포함) |
| `npm run build` | 배포용 파일을 `dist/`에 생성 |
| `npm run preview` | 빌드 결과를 로컬에서 확인 |

## 4. 자동 테스트 구성 (145개, 20개 파일)

> 자동 테스트는 **실제 Supabase·GitHub·Formspree에 요청하지 않습니다.** 가짜(Mock) 데이터와 가짜 응답으로 화면 흐름을 검증합니다. (`src/test/setup.js`가 실제 네트워크 요청을 막습니다.) 실제 서버 연결은 [OWNER_CHECKLIST.md](OWNER_CHECKLIST.md) 5단계에서 따로 확인합니다.

| 파일 | 검증 내용 |
| --- | --- |
| `src/App.test.jsx` | 라우트 6개 + Not Found, 공통 레이아웃, 메뉴 이동, 모바일 메뉴, 맨 위로 버튼 |
| `src/components/ui/ui.test.jsx` | 재사용 UI의 props별 동작, 확인 창 포커스·Tab·Esc |
| `src/contexts/displaySettings.test.jsx` | 테마 Auto/수동/저장/시스템 변경, 언어 전환·저장 |
| `src/lib/i18n.test.js` | 한·영 사전 문구 목록 일치, 번역 함수 |
| `src/hooks/useTypingEffect.test.jsx` | 타이핑 진행·지연·언어 전환 |
| `src/components/home/ContactForm.test.jsx` | 문의 폼 검사·전송 중·성공·실패 |
| `src/components/home/GithubSection.test.jsx` | GitHub 로딩·성공·실패·재시도·빈 상태 |
| `src/lib/githubApi.test.js` | 저장소 정렬·필터 |
| `src/pages/HomePage.test.jsx` | 홈 섹션 순서, 영어 전환 |
| `src/lib/projectsApi.test.js` | 가짜 Supabase로 CRUD 요청 모양·오류·RLS 0행 감지·시간 초과 |
| `src/lib/projectForm.test.js` | 필수값·글자 수·URL·이미지 주소 검사, 폼 ↔ 데이터 변환 |
| `src/lib/schemaSync.test.js` | **SQL 테이블 열 ↔ React 코드 필드·분류·글자 수 일치** |
| `src/lib/request.test.js` | 15초 시간 제한, 안전한 링크·이미지 주소 판별 |
| `src/lib/errors.test.js` | 오류 → 안내 문구 변환 |
| `src/lib/supabaseClient.test.js`, `src/lib/authApi.test.js` | `.env`가 없을 때 안내 동작 |
| `src/hooks/projectHooks.test.jsx` | useProjects / useProject / useProjectActions 상태 변화 |
| `src/pages/projectPages.test.jsx` | 목록 필터, 상세, 삭제 확인, 등록 검사·미리보기·저장 중, 수정 |
| `src/pages/authFlow.test.jsx` | 방문자 제한, 보호 라우트, 로그인 성공·실패, 로그아웃 |
| `src/pages/securityHardening.test.jsx` | 관리자 아닌 계정, 로그아웃 후 차단, 연속 클릭, HTML·`javascript:` 삽입, 영어 공통 문구 |

## 5. 직접 확인하기 (체크리스트)

### Supabase 없이 확인 가능

- [ ] 홈 제목이 한 글자씩 타이핑된다
- [ ] 스크롤하면 About·Expertise가 아래에서 떠오른다
- [ ] EN 버튼 → 영어, KR 버튼 → 한국어. 새로고침해도 유지
- [ ] Dark → 어두운 화면, Auto ✓ → 운영체제 설정을 따름. 새로고침해도 유지
- [ ] 창을 좁히면 햄버거 메뉴가 나오고 열고 닫힌다
- [ ] 문의 폼을 비우고 Send → 세 칸 모두 오류 문구
- [ ] `/아무거나` 주소 → 404 화면
- [ ] `/about` 아래쪽 GitHub 카드 (GitHub API 요청 한도를 넘으면 오류 + 다시 시도)
- [ ] `/projects/new` → 로그인 화면으로 이동

### Supabase 연결 후 확인 ([supabase-setup.md](supabase-setup.md) 9단계 참고)

- [ ] 방문자: 목록·상세 보기만 가능, 등록·수정·삭제 버튼 없음
- [ ] 관리자 로그인 → 등록 → 상세로 이동 + 알림
- [ ] 수정 → 바뀐 내용 반영 + 알림
- [ ] 삭제 → 확인 창 → 목록에서 사라짐 + 알림
- [ ] 로그아웃 → 관리 버튼 사라짐
- [ ] SQL `05_verify_rls.sql` 블록 A·B·C → [security-review.md](security-review.md) 3번 표와 같은 결과

## 6. 브라우저 실전 검증 기록 (가짜 API 사용)

작업 중 Playwright(크롬 엔진)로 실제 화면을 띄워 46개 항목을 확인했습니다. 프로젝트 데이터·로그인은 **메모리 속 가짜 API**로 바꿔 실행했으므로 실제 Supabase 검증은 아닙니다.

| 분류 | 확인 내용 | 결과 |
| --- | --- | --- |
| 화면 크기 | 1440 / 1024 / 768 / 375px × 6개 화면 가로 넘침 | 24/24 없음 |
| 헤더 | 관리자 로그인 상태(메뉴 5개) 1024·1280px, 한·영 겹침 | 없음 |
| 모바일 메뉴 | 열기 → 이동 → 자동 닫힘 | 정상 |
| 새로고침 | 상세 화면에서 새로고침 | 같은 화면 유지 |
| 잘못된 주소·ID | `/nope`, `/projects/zzz` | 404 / "찾을 수 없습니다" |
| 상태 화면 | 로딩 → 오류 → 다시 시도 → 복구, 빈 데이터 | 정상 |
| 키보드 | Tab 순서, 카드 Enter, 포커스 테두리, 확인 창 Esc | 정상 |
| 잘못된 입력 | 61자 제목, 공백 소개, 빈 설명, `javascript:` 링크, 잘못된 이미지 주소 | 오류 5개, 저장 요청 0회 |
| 긴 입력 | 띄어쓰기 없는 60자 제목, 120자 소개, 긴 설명 | 카드·상세 넘침 없음 |
| 연속 클릭 | 등록 더블클릭, 삭제 확인 더블클릭 | 각 1번만 요청 |
| 권한 | 관리자 아닌 계정: 버튼 없음, `/projects/new` 권한 없음 | 정상 |
| 콘솔 오류 | 전체 | 0건 |

실제 브라우저에서 확인하지 못한 것: 실제 Supabase·로그인, GitHub API 성공 화면(작업 환경 IP의 요청 한도 초과로 오류 화면만 확인), 문의 실제 전송, 사파리·실제 휴대폰, 15초 시간 초과(자동 테스트로만 확인).

## 7. 문제 해결

| 증상 | 해결 |
| --- | --- |
| `npm: command not found` | Node.js 설치 (https://nodejs.org LTS) |
| 포트 5173 사용 중 | 터미널에 표시되는 다른 주소(5174 등)로 접속 |
| `.env`를 고쳤는데 그대로 | 개발 서버를 껐다 켜기 |
| 테스트가 하나만 실패 | 실패한 테스트 이름과 `Expected / Received`를 읽고 해당 파일 확인 |
