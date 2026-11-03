# 03. 데이터 흐름 — 클릭 한 번이 화면에 반영되기까지

## 1. 하나의 기능: 라우팅 → 컴포넌트 → 상태 → 이벤트 → 렌더링

**"프로젝트 목록에서 '교육' 필터를 누른다"**

```text
① 라우팅    주소 /projects  ──► App.jsx의 <Route path="/projects">  ──► ProjectListPage
② 컴포넌트  ProjectListPage ──► useProjects() 로 데이터 요청
                            ──► <FilterBar> <ProjectList> 에 props 전달
③ 상태      category = "all" (useState), projects = [...] (훅)
④ 이벤트    "교육" 버튼 클릭 ──► FilterBar가 onChange("education") 호출
                            ──► 부모의 setCategory("education")
⑤ 렌더링    category가 바뀜 ──► ProjectListPage 다시 실행
                            ──► useMemo가 visibleProjects 다시 계산
                            ──► "1개의 프로젝트…" 문구와 카드 목록이 바뀜
                            ──► FilterBar의 "교육" 버튼이 선택 표시(aria-pressed)
```

관련 코드: `src/pages/ProjectListPage.jsx:20` (state), `:21` (useMemo), `:52` (FilterBar 연결)

## 2. 상태 변경 → 화면 변화 지점 (공식 요구 3곳 이상)

| # | 사용자 행동 | 바뀌는 state | 화면 변화 | 코드 |
| --- | --- | --- | --- | --- |
| 1 | 필터 버튼 클릭 | `category` | 카드 목록·개수 문구 변경 | `pages/ProjectListPage.jsx:20` |
| 2 | 폼에 입력 | `values` | 미리보기 카드·글자 수(0/120) 즉시 변경 | `components/project/ProjectForm.jsx:21-23` |
| 3 | 저장 성공 | Toast의 `message` | 알림 표시 → 3초 뒤 사라짐, 상세 화면으로 이동 | `pages/ProjectCreatePage.jsx:18-19` |
| 4 | 삭제 버튼 | `isConfirmOpen` | 확인 창 열림/닫힘 | `pages/ProjectDetailPage.jsx` |
| 5 | 제출 버튼 | `isSubmitting` | 버튼 비활성화 + "저장 중..." | `hooks/useProjectActions.js` |
| 6 | 필수값 비우고 제출 | `errors` | 입력칸 아래 빨간 오류, 테두리 색 | `ProjectForm.jsx` |
| 7 | Dark / Auto 버튼 | `mode` | 전체 색상 변경 | `contexts/ThemeContext.jsx` |
| 8 | EN / KR 버튼 | `language` | 모든 문구 변경 | `contexts/LanguageContext.jsx` |
| 9 | 문의 전송 | `status` | "전송 중…" → 성공/실패 문구 | `components/home/ContactForm.jsx:15` |
| 10 | 햄버거 메뉴 | `isMenuOpen` | 모바일 메뉴 열림 | `components/layout/Header.jsx:16` |
| 11 | 로그인 / 로그아웃 | Auth `session` | 헤더 New·Logout, 수정·삭제 버튼 표시 여부 | `contexts/AuthContext.jsx` |

## 3. CRUD 흐름

### 조회 (Read)

```text
ProjectListPage 화면에 나타남
 └ useProjects() ─ useAsyncData(fetchProjects)
     └ useEffect 실행 (처음 1번)
         └ fetchProjects() ─ getSupabase().from("projects").select(...).order("created_at")
             ├ 성공: rows.map(fromRow) ─► data 저장 ─► isLoading=false ─► 카드 표시
             ├ 0개:  EmptyState "아직 등록된 프로젝트가 없습니다."
             └ 실패: toErrorKey(error) ─► ErrorState + [다시 시도] ─► reload() ─► 다시 요청
```

상세는 `useProject(id)` — 주소의 `:id`가 바뀌면 다시 요청합니다.

### 등록 (Create)

```text
[등록하기] 클릭
 └ ProjectForm.handleSubmit
     ├ validateProjectForm(values) ─ 오류 있으면 여기서 멈춤 (요청 안 보냄)
     └ onSubmit(toProjectInput(values))
         └ ProjectCreatePage.handleSubmit
             └ useProjectActions.create(input)   ← isSubmitting = true (버튼 비활성화)
                 │                                   이미 실행 중이면 무시 (더블클릭 방지)
                 └ createProject(input, projectId) ─ insert({ id, ...toRow(input) })   (15초 제한)
                     │  projectId는 화면이 열릴 때 한 번 만든 UUID → 다시 저장해도 같은 id
                     │  같은 id가 이미 있으면(늦게 저장된 이전 시도) 그 행을 수정 → 중복 등록 없음
                     ├ 성공: showToast("프로젝트를 등록했습니다.") ─► navigate(/projects/새id)
                     └ 실패: error = "errors.permission" 등 ─► 폼 위 빨간 상자, 입력값 유지
```

### 수정 (Update)

`useProject(id)`로 기존 값 조회 → `toFormValues`로 폼 초기값 → 제출 → `updateProject(id, input)` → 성공 시 상세로 이동 + 알림.

### 삭제 (Delete)

[삭제] → `ConfirmDialog` 열림 → [삭제] 확인 → `remove(id)` → `deleteProject` → 성공 시 알림 + `/projects`로 이동 → 목록이 다시 조회되어 사라진 것이 반영됨. 실패 시 상세에 머물며 이유 표시.

## 4. Supabase 저장 흐름과 보안

```text
브라우저 (React)                          Supabase
───────────────                          ─────────────────────────────
anon 키 + (로그인 시) 사용자 토큰  ───►   PostgREST API
                                          └ RLS 정책 검사
                                              ├ SELECT: 누구나 허용
                                              └ INSERT/UPDATE/DELETE: is_admin() 일 때만
                                          └ projects 테이블
```

- `anon` 키는 공개용입니다. 브라우저 코드에 들어가는 것이 정상입니다.
- 화면에서 버튼을 숨기는 것(`user &&`)은 **편의 기능**입니다.
- **실제 차단은 RLS**: 방문자가 개발자 도구로 삭제 요청을 직접 보내도 DB가 0행 처리합니다.
- 관리자 = `admin_users` 표에 등록된 계정. 공개 회원가입은 꺼 둡니다.
- 화면의 `isAdmin`도 같은 DB 함수 `is_admin()`으로 확인하므로, 관리자가 아닌 계정에는 관리 버튼이 보이지 않습니다. 그래도 최종 판단은 DB가 합니다.
- 자세한 검토: [security-review.md](security-review.md)

## 5. 로그인 흐름

```text
방문자가 /projects/new 접속
 └ ProtectedRoute: user 없음 ─► <Navigate to="/login" state={{ from: "/projects/new" }}>
     └ LoginPage: 이메일·비밀번호 검사 ─► signIn() ─► Supabase Auth
         ├ 실패: "이메일 또는 비밀번호가 올바르지 않습니다."
         └ 성공: onAuthStateChange ─► AuthContext session 변경
                 ─► checkIsAdmin() ─► DB 함수 is_admin() ─► isAdmin true/false
                 ─► 알림 + navigate(from) ─► ProtectedRoute 다시 검사
                      ├ isAdmin true  ─► 원래 가려던 /projects/new
                      └ isAdmin false ─► "관리자 권한이 없는 계정입니다." 
```

## 6. 동료에게 30초 설명

> "B1-1 포트폴리오를 React SPA로 바꾼 서비스예요. 주소마다 페이지 컴포넌트가 있고(8개 라우트), 페이지는 커스텀 훅으로 Supabase 데이터를 받아 재사용 UI 컴포넌트에 props로 넘겨요. 로딩·오류·빈 상태는 DataStatus 하나로 통일했고, 등록·수정은 하나의 ProjectForm이 입력 검사와 실시간 미리보기를 담당해요. 테마·언어·알림·로그인은 Context로 전역 관리하고, 수정·삭제 권한은 화면이 아니라 Supabase RLS가 막아요."

### 한 장 요약

```text
주소 ─► pages ─► hooks (useProjects…) ─► lib (projectsApi) ─► Supabase
          │                                                     │
          └─► components (props) ◄────── data / isLoading / error ┘
                    │
        사용자 이벤트 ─► setState ─► 다시 렌더링
```
