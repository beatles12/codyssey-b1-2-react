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
| 01·02 다시 실행 (멱등성) | 오류 없음 |
| 05 블록 A (방문자) | 조회 4건, 삭제 시 `permission denied for table projects` |
| 05 블록 B (일반 로그인) | is_admin `false`, 삭제 0, 수정 0, 등록 시 `new row violates row-level security policy` |
| 05 블록 C (관리자) | is_admin `true`, 등록·수정·삭제 각 1행, rollback 후 데이터 4건 그대로 |

**한계**: Supabase의 실제 `auth` 스키마, PostgREST(API 서버), JWT 검증, 대시보드 설정(회원가입 OFF 등)은 흉내 내지 못했습니다. 그래서 이 결과는 "SQL 문법과 정책 논리가 의도대로 동작한다"는 근거일 뿐, 실제 서비스 보안의 증명이 아닙니다.

## 4. 사용자별 실제 테스트 절차 (직접 해야 함)

### 4-1. SQL로 (Supabase SQL Editor)

`supabase/05_verify_rls.sql`의 블록 A·B·C를 **하나씩 선택해서** 실행하고 3번 표와 같은지 비교합니다. (OWNER_CHECKLIST 5-3단계)

### 4-2. 브라우저로 — 방문자가 API를 직접 부르는 상황

1. 로그아웃 상태로 배포 사이트(또는 localhost) 열기
2. **F12** → **Console** 탭
3. 아래를 붙여넣고 Enter (URL·키는 `.env`의 값, 이 문서에 적지 마세요)

```js
const url = "여기에_VITE_SUPABASE_URL";
const key = "여기에_VITE_SUPABASE_ANON_KEY";
const res = await fetch(`${url}/rest/v1/projects?id=not.is.null`, {
  method: "DELETE",
  headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation" },
});
console.log(res.status, await res.text());
```

- **정상(차단됨)**: `401`/`403` 상태와 `permission denied` 메시지, 또는 `[]`(0행)
- **위험**: 프로젝트 목록이 담긴 응답이 오고 Table Editor에서 데이터가 사라짐 → 즉시 `02_policies.sql` 다시 실행

### 4-3. 관리자가 아닌 계정

1. Authentication → Users → Add user로 테스트 계정 생성 (admin_users에는 등록하지 않음)
2. 그 계정으로 로그인 → 헤더에 **Logout만** 있고 New 없음
3. 주소창 `/projects/new` → "관리자 권한이 없는 계정입니다."
4. 시험 후 테스트 계정 삭제

### 결과가 다를 때

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 블록 A에서 삭제가 성공함 | 02를 실행하지 않았거나 중간에 실패 | 02 다시 실행 후 Table Editor에서 RLS enabled 확인 |
| 블록 B에서 insert 성공 | 정책이 `is_admin()` 없이 만들어짐 | 02 다시 실행 (기존 정책을 지우고 다시 만듦) |
| 블록 C에서 is_admin false | 03 이메일이 다름 | 03의 이메일을 Users 화면과 똑같이 |
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
| HTML·스크립트 삽입 | React가 글자로만 표시(`<script>`가 실행되지 않음), `dangerouslySetInnerHTML` 사용 없음 | `securityHardening.test.jsx` |
| `javascript:` 링크·이미지 | 표시 단계에서 차단(`toSafeLinkUrl`, `toSafeImageUrl`) + 폼 검사 + DB CHECK 제약 | 테스트, `01_schema.sql` |
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
2. 시간 초과(15초) 뒤에도 실제 요청은 계속될 수 있어, 늦게 저장이 완료될 수 있음 → 안내 문구로 "목록에서 확인 후 다시 시도" 안내
3. Supabase 무료 플랜은 1주일 사용이 없으면 일시정지될 수 있음 → 제출·평가 전 대시보드에서 상태 확인
4. 관리자 비밀번호는 길고 고유하게, 가능하면 Supabase 계정에 2단계 인증 설정
