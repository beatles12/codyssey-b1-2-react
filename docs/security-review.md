# 보안·관리자 권한 검토

> 이 문서의 결론은 **코드 정적 검토 + 자동 테스트(가짜 API) + 로컬 PostgreSQL 모의 실행**까지입니다.
> **실제 Supabase에서 RLS가 막는지는 아직 확인되지 않았습니다.** 아래 "사용자별 실제 테스트 절차"로 직접 확인해야 합니다.

## 1. 두 겹의 방어 — 화면과 DB의 차이

| 층 | 무엇을 하나 | 우회 가능? |
| --- | --- | --- |
| 화면 (React) | 관리자가 아니면 New·등록·수정·삭제 버튼을 숨기고, `/projects/new`·`/edit` 주소는 `ProtectedRoute`가 막음 | **가능.** 브라우저 개발자 도구나 직접 만든 요청으로 Supabase API를 바로 부를 수 있음 |
| DB (Supabase RLS) | 요청이 어디서 오든 `is_admin()`이 아니면 INSERT/UPDATE/DELETE를 거절 | 불가 (anon 키로는 RLS를 끌 수 없음) |

화면 쪽은 **사용 편의**, DB 쪽이 **진짜 보안**입니다. `anon` 키가 브라우저에 공개되는 것은 정상이며, 그래서 RLS가 반드시 켜져 있어야 합니다.

## 2. RLS 정책 검토 (`supabase/02_policies.sql`)

| 테이블 | 명령 | 방문자 (anon) | 로그인 + 관리자 아님 | 관리자 |
| --- | --- | --- | --- | --- |
| projects | SELECT | ✅ 허용 (`using (true)`) | ✅ | ✅ |
| projects | INSERT | ❌ 테이블 권한 없음 (`revoke`) | ❌ RLS `with check (is_admin())` | ✅ |
| projects | UPDATE | ❌ 테이블 권한 없음 | ❌ 0행 처리 (`using (is_admin())`) | ✅ |
| projects | DELETE | ❌ 테이블 권한 없음 | ❌ 0행 처리 | ✅ |
| admin_users | SELECT | ❌ 권한 없음 | 자기 행만 | 자기 행만 |
| admin_users | INSERT/UPDATE/DELETE | ❌ | ❌ (정책 없음) | ❌ (정책 없음 → SQL Editor에서만 등록) |
| `is_admin()` 함수 | 실행 | ❌ (`revoke execute`) | ✅ (false 반환) | ✅ (true 반환) |

검토 포인트

- **관리자 판단 기준이 "로그인 여부"가 아니라 `admin_users` 등록 여부**입니다. 다른 계정으로 로그인해도 관리 권한이 생기지 않습니다.
- 관리자 목록(`admin_users`)에는 추가 정책이 없어 **앱에서 스스로 관리자가 될 방법이 없습니다.** 등록은 대시보드의 SQL Editor(postgres 권한)에서만 가능합니다.
- `is_admin()`은 `security definer` + `set search_path = ''`로, 함수 바꿔치기 공격을 막고 admin_users를 직접 노출하지 않습니다.
- 정책에 `(select public.is_admin())` 형태를 써서 행마다 함수를 다시 부르지 않게 했습니다(Supabase 권장 성능 패턴).
- 공개 회원가입은 대시보드에서 꺼야 합니다(SQL로 할 수 없음). 켜져 있어도 새 계정은 관리자가 아니므로 쓰기는 막히지만, 불필요한 계정이 생기지 않게 끄는 것을 권장합니다.
- UPDATE/DELETE가 RLS에 막히면 Supabase는 **오류 대신 0행**으로 응답합니다. 앱은 이를 `notChanged` 오류로 바꿔 화면에 알립니다(`src/lib/projectsApi.js`의 `ensureChanged`).

## 3. 로컬 PostgreSQL 모의 실행 결과 (실제 Supabase 아님)

작업 환경에 설치된 PostgreSQL 16에 **Supabase의 기본 환경만 흉내 낸 가짜 구성**(anon·authenticated 역할, `auth.users` 표, `auth.uid()` 함수, Supabase와 같은 기본 테이블 권한)을 만들고 SQL 파일을 실행했습니다.

| 확인 | 결과 |
| --- | --- |
| 01 → 02 → 03 → 04 순서 실행 | 오류 없음 |
| 01·02 다시 실행 (멱등성), 예전 01로 만든 표에 새 01 실행(주소 제약 교체) | 오류 없음, 새 제약 적용 |
| 이미지 주소 19가지 예시: JS 검사 vs DB 제약 | 결과 19/19 일치 (`//example.com`, `/\example.com` 모두 거절) |
| 같은 id로 두 번 등록 | 두 번째는 `23505 duplicate key` → 앱은 수정으로 처리 |

`05_verify_rls.sql`을 일부러 **안전한 설정과 위험한 설정**에서 모두 실행했습니다. 모든 경우에 실제 프로젝트 4건은 그대로였고 시험용 행도 남지 않았습니다.

| 설정 | 05 결과 첫 줄 | 실제 데이터 |
| --- | --- | --- |
| 정상 (02 적용) | ✅ RLS 점검 통과 — 방문자·일반 계정 쓰기 차단, 관리자 등록·수정·삭제 성공 | 4건 → 4건 |
| 방문자에게 모든 권한 + "누구나 쓰기" 정책 | ❌ 실패 6건 (방문자·일반 계정 삭제·수정·등록 허용됨) | 4건 → 4건 |
| 권한은 정상, 정책만 "누구나 쓰기" | ❌ 실패 3건 (일반 계정 쓰기 허용됨) | 4건 → 4건 |
| 관리자 미등록 | ❌ 실패 4건 (관리자 is_admin false) | 4건 → 4건 |
| RLS 꺼짐 | 시작 전에 중단 "RLS가 꺼져 있습니다" | 4건 → 4건 |
| 파일 일부(DELETE 한 줄)만 선택 실행 | 문법 오류로 아무 일도 일어나지 않음 | 4건 → 4건 |

**한계**: Supabase의 실제 `auth` 스키마, PostgREST(API 서버), JWT 검증, 대시보드 설정(회원가입 OFF 등)은 흉내 내지 못했습니다. 그래서 이 결과는 "SQL 문법과 정책 논리가 의도대로 동작한다"는 근거일 뿐, 실제 서비스 보안의 증명이 아닙니다.

## 4. 사용자별 실제 테스트 절차 (직접 해야 함)

> **안전 원칙**: 어떤 시험도 실제 프로젝트를 대상으로 하지 않습니다. 조건 없는 삭제·수정(`id=not.is.null`, `delete from projects;` 같은 것)은 절대 실행하지 마세요. 설정이 잘못되어 있으면 그 명령이 정말로 모든 데이터를 지웁니다.

### 4-1. SQL로 (Supabase SQL Editor) — 가장 안전, 먼저 하세요

1. `supabase/05_verify_rls.sql`의 `admin_email`을 내 관리자 이메일로 바꿉니다.
2. **파일 전체**를 붙여넣고 Run 합니다.
3. 빨간 ERROR 상자 안의 첫 줄이 `✅ RLS 점검 통과`이면 성공입니다. (ERROR는 시험용 변경을 되돌리기 위한 정상 동작)

이 파일은 스스로 만든 `__rls_test__` 시험용 행만 건드리고, 끝나면 전부 취소합니다. 실제 프로젝트 개수를 시험 전·후로 비교해 함께 보여줍니다.

### 4-2. (선택) 브라우저로 — 방문자가 API를 직접 부르는 상황

실제 API 서버(PostgREST)까지 포함해 확인하고 싶을 때만 합니다. **시험용 프로젝트 1개만** 대상으로 합니다.

1. 관리자로 로그인해 제목이 `RLS 시험용 (지워져도 됨)`인 프로젝트를 **새로** 등록합니다.
2. 그 상세 화면 주소 끝의 id(36자, 예: `…/projects/1a2b3c4d-…`)를 복사합니다.
3. **로그아웃**한 뒤 **F12** → **Console** 탭
4. 아래를 붙여넣고 세 칸을 채운 뒤 Enter (URL·키는 `.env`의 값. 이 문서나 GitHub에 적지 마세요)

```js
const url = "여기에_VITE_SUPABASE_URL";
const key = "여기에_VITE_SUPABASE_ANON_KEY";
const testId = "여기에_시험용_프로젝트_id";
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(testId)) {
  throw new Error("시험용 프로젝트 id(36자)를 정확히 넣으세요. 아무 요청도 보내지 않고 중단합니다.");
}
const target = `${url}/rest/v1/projects?id=eq.${testId}`;
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" };
const del = await fetch(target, { method: "DELETE", headers });
console.log("삭제 시도:", del.status, await del.text());
const patch = await fetch(target, { method: "PATCH", headers, body: JSON.stringify({ summary: "rls-check" }) });
console.log("수정 시도:", patch.status, await patch.text());
```

- **정상(차단됨)**: 두 줄 모두 `401` 또는 `403`과 `permission denied`, 또는 `200 []`(0행)
- **위험**: 응답에 시험용 프로젝트 내용이 담겨 옴 → 시험용 1건만 영향받습니다. 즉시 `02_policies.sql`을 다시 실행하고 4-1을 다시 하세요.
- 시험 후 앱에서 시험용 프로젝트가 그대로 있는지 확인하고, 관리자로 로그인해 삭제합니다.

`testId` 검사 줄 덕분에 id를 비우거나 잘못 넣으면 요청이 나가지 않습니다. 필터는 항상 `id=eq.<시험용 id>` 하나만 씁니다.

### 4-3. 관리자가 아닌 계정

1. Authentication → Users → Add user로 테스트 계정 생성 (admin_users에는 등록하지 않음)
2. 그 계정으로 로그인 → 헤더에 **Logout만** 있고 New 없음
3. 주소창 `/projects/new` → "관리자 권한이 없는 계정입니다."
4. 시험 후 테스트 계정 삭제

### 결과가 다를 때

| 05 결과 | 원인 | 해결 |
| --- | --- | --- |
| "RLS가 꺼져 있습니다" | 02 미실행 | 02 실행 후 다시 |
| `[방문자] … ❌ 허용됨` | 02의 권한 줄(`revoke`/`grant`)이 빠지거나 다른 정책이 추가됨 | 02 다시 실행. Table Editor → projects → Policies에 02에 없는 정책이 있으면 삭제 |
| `[일반 계정] … ❌ 허용됨` | `is_admin()` 조건이 없는 정책이 있음 | 위와 같음 |
| `[관리자] ⚠ … 찾지 못해` | `admin_email` 오타 | Users 화면의 이메일을 그대로 복사 |
| `[관리자] is_admin ❌ false` | 03 미실행 또는 다른 이메일로 등록 | 03 실행 |
| 관리자 로그인 후 화면에 "관리자 권한이 없는 계정" | 위와 같음, 또는 `is_admin` 함수 없음(02 미실행) | 03 / 02 실행 |

## 5. 프런트엔드 점검 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 비로그인 등록·수정 화면 접근 | 로그인 화면으로 이동 | `ProtectedRoute`, 테스트 `authFlow.test.jsx` |
| 주소 직접 입력 | 동일하게 차단 | 테스트 + 브라우저 확인 |
| 로그인했지만 관리자 아님 | 관리 버튼 숨김, 보호 화면에 권한 없음 안내 | `AuthContext`의 `isAdmin`(`is_admin` RPC), `securityHardening.test.jsx` |
| 관리자 확인 실패(함수 없음·네트워크) | 관리자가 아닌 것으로 처리 (안전한 쪽으로 실패) | 같은 테스트 |
| 로그아웃 후 | 버튼 사라짐, 보호 화면 접근 시 로그인으로 | 같은 테스트 |
| 연속 클릭으로 중복 저장·삭제 | 실행 중 잠금(`useProjectActions`의 `isRunningRef`) | 테스트 + 브라우저 더블클릭 확인 |
| 시간 초과 뒤 다시 저장 → 중복 등록 | 등록 화면이 id를 한 번 만들어 재시도에도 같은 id 사용. 이미 저장돼 있으면(`23505`) 그 행을 수정 | `projectsApi.test.js`, `projectPages.test.jsx`, 로컬 DB에서 오류 코드 확인 |
| 시간 초과 뒤 다시 삭제 | 행이 이미 없으면 성공으로 처리, 남아 있으면 권한 오류 | `projectsApi.test.js` |
| HTML·스크립트 삽입 | React가 글자로만 표시(`<script>`가 실행되지 않음), `dangerouslySetInnerHTML` 사용 없음 | `securityHardening.test.jsx` |
| `javascript:` 링크·이미지, `//외부주소` 이미지 | 표시 단계에서 차단(`toSafeLinkUrl`, `toSafeImageUrl`) + 폼 검사 + DB CHECK 제약 (JS와 같은 규칙) | `request.test.js`, `schemaSync.test.js`, `01_schema.sql` |
| 응답 없음 | 15초 뒤 오류 안내(무한 로딩 방지) | `request.test.js`, `projectsApi.test.js` |

## 6. 비밀값 노출 검사

| 검사 | 결과 |
| --- | --- |
| 전체 커밋 기록에서 JWT(`eyJ…`), `sb_secret_`, `sb_publishable_`, 실제 `*.supabase.co` 주소, GitHub·AWS 토큰, 개인키 검색 | 없음 (문서 예시 주소 `abcd1234.supabase.co`만) |
| Git이 추적하는 `.env` 파일 | `.env.example`만 |
| 코드의 비밀번호 | 없음 (테스트용 가짜 문자열만) |
| Formspree 폼 ID | B1-1에도 공개된 식별자, 비밀 아님 |

다시 검사하는 명령 (PowerShell / 터미널):

```bash
git log -p --all | findstr /R "eyJ sb_secret_ service_role"
```

(맥·리눅스는 `findstr /R` 대신 `grep -E`)

## 7. 남은 위험과 권장 사항

1. **실제 RLS 미검증** — 4번 절차를 반드시 실행
2. 시간 초과(15초)는 화면의 기다림만 끝내고 실제 요청은 취소하지 않습니다. 그래서 늦게 저장이 완료될 수 있습니다.
   등록은 같은 id 재사용으로 중복이 생기지 않지만, **등록 화면을 닫았다가 새로 열어 다시 등록**하면 새 id가 만들어져 같은 내용이 2건이 될 수 있습니다 → 시간 초과 안내가 뜨면 같은 화면에서 다시 저장하거나, 목록을 먼저 확인하세요.
3. Supabase 무료 플랜은 1주일 사용이 없으면 일시정지될 수 있음 → 제출·평가 전 대시보드에서 상태 확인
4. 관리자 비밀번호는 길고 고유하게, 가능하면 Supabase 계정에 2단계 인증 설정
