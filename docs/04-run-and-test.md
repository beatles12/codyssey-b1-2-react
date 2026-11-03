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

## 4. 자동 테스트 구성 (118개, 17개 파일)

> 자동 테스트는 **실제 Supabase·GitHub·Formspree에 요청하지 않습니다.** 가짜(Mock) 데이터와 가짜 응답으로 화면 흐름을 검증합니다. 실제 서버 연결은 5단계(직접 확인)로 따로 해야 합니다.

| 파일 | 검증 내용 |
| --- | --- |
| `src/App.test.jsx` | 라우트 6개 + Not Found, 공통 레이아웃, 메뉴 이동, 모바일 메뉴, 맨 위로 버튼 |
| `src/components/ui/ui.test.jsx` | 재사용 UI 11개의 props별 동작 |
| `src/contexts/displaySettings.test.jsx` | 테마 Auto/수동/저장/시스템 변경, 언어 전환·저장 |
| `src/lib/i18n.test.js` | 한·영 사전 문구 목록 일치, 번역 함수 |
| `src/hooks/useTypingEffect.test.jsx` | 타이핑 진행·지연·언어 전환 |
| `src/components/home/ContactForm.test.jsx` | 문의 폼 검사·전송 중·성공·실패 |
| `src/components/home/GithubSection.test.jsx` | GitHub 로딩·성공·실패·재시도·빈 상태 |
| `src/lib/githubApi.test.js` | 저장소 정렬·필터 |
| `src/pages/HomePage.test.jsx` | 홈 섹션 순서, 영어 전환 |
| `src/lib/projectsApi.test.js` | 가짜 Supabase로 CRUD 요청 모양·오류 처리·RLS 0행 감지 |
| `src/lib/projectForm.test.js` | 필수값·글자 수·URL 검사, 폼 ↔ 데이터 변환 |
| `src/lib/errors.test.js` | 오류 → 안내 문구 변환 |
| `src/lib/supabaseClient.test.js`, `src/lib/authApi.test.js` | `.env`가 없을 때 안내 동작 |
| `src/hooks/projectHooks.test.jsx` | useProjects / useProject / useProjectActions 상태 변화 |
| `src/pages/projectPages.test.jsx` | 목록 필터, 상세, 삭제 확인, 등록 검사·미리보기·저장 중, 수정 |
| `src/pages/authFlow.test.jsx` | 방문자 제한, 보호 라우트, 로그인 성공·실패, 로그아웃 |

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
- [ ] SQL `05_verify_rls.sql` → 방문자 삭제 0행

## 6. 문제 해결

| 증상 | 해결 |
| --- | --- |
| `npm: command not found` | Node.js 설치 (https://nodejs.org LTS) |
| 포트 5173 사용 중 | 터미널에 표시되는 다른 주소(5174 등)로 접속 |
| `.env`를 고쳤는데 그대로 | 개발 서버를 껐다 켜기 |
| 테스트가 하나만 실패 | 실패한 테스트 이름과 `Expected / Received`를 읽고 해당 파일 확인 |
