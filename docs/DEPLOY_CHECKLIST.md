# DEPLOY CHECKLIST — 실제 DB 검증과 Vercel 배포

> 대상: Supabase 프로젝트 생성, 01·02·03 SQL 실행, 관리자 계정 설정까지 마친 상태.
> 이 문서에는 실제 키·비밀번호가 없습니다. 여러분의 키도 문서·GitHub·채팅에 적지 마세요.

## 0. 점검 결과 요약 (코드 쪽, 배포 전)

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 최신 코드 · 테스트 | ✅ 깨끗한 설치(`npm ci`) 후 테스트 187개 통과, lint 0, build 성공 | — |
| Publishable key 호환 | ✅ 코드 수정 필요 없음. `sb_publishable_…` 키를 **`VITE_SUPABASE_ANON_KEY`에 그대로** 넣으면 됨 | supabase-js 2.118.0이 새 키를 `apikey` 헤더로 보내는 것을 가짜 요청으로 확인 |
| 비밀키 실수 방지 | ✅ `sb_secret_…`·`service_role` 키를 넣으면 **빌드가 멈춤** (공개 사이트에 노출되지 않게) | `scripts/supabaseKey.js`, `vite.config.js` |
| 환경변수 이름 | ✅ 코드가 읽는 이름은 정확히 아래 3개뿐 | `src/lib/supabaseClient.js`, `src/lib/contactApi.js` |
| 새로고침 404 방지 | ✅ `vercel.json` rewrite 정상. Vercel 규칙을 흉내 낸 로컬 서버에서 `/about`, `/projects/:id`, `/projects/new`, `/login`, `/없는주소` 직접 접속·새로고침 모두 정상, 이미지·JS 파일은 그대로 제공 | `vercel.json` |
| 이미지 경로 대소문자 | ✅ 코드가 쓰는 `/images/…` 8개가 실제 파일명과 정확히 일치 (Vercel은 대소문자 구분) | `public/images` |
| 실제 Supabase 연결 | ⏳ 아직 확인 안 함 → 아래 1~2단계 | — |

## 환경변수 (로컬 `.env`와 Vercel에 같은 이름으로)

| 이름 | 값 | 필수 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase **Project URL** (`https://<프로젝트ID>.supabase.co`) | 필수 |
| `VITE_SUPABASE_ANON_KEY` | **Publishable key** (`sb_publishable_…`) 또는 예전 anon 키 (`eyJ…`) | 필수 |
| `VITE_FORMSPREE_ID` | 문의 폼 ID. 비우면 B1-1에서 쓰던 공개 폼 ID 사용 | 선택 |

- 이름 앞의 `VITE_`를 빼거나 `PUBLISHABLE`로 바꾸면 앱이 값을 읽지 못합니다. (Vercel의 Supabase 연동이 자동으로 만드는 `NEXT_PUBLIC_…` 이름도 이 앱에서는 쓰이지 않습니다)
- `VITE_` 값은 빌드할 때 화면 코드에 들어갑니다. **값을 바꾼 뒤에는 다시 빌드(Vercel은 Redeploy)** 해야 반영됩니다.
- ⚠️ **Secret key(`sb_secret_…`)·service_role 키는 절대 넣지 않습니다.** 넣으면 빌드가 멈추도록 해 두었지만, 실수로 어딘가에 붙여넣었다면 Supabase에서 그 키를 폐기(Revoke/Roll)하세요.

---

## 1단계. 실제 DB 안전 점검 (데이터 변경 없음)

### 1-1. (01을 예전 버전으로 실행했다면) 최신 01 다시 실행

`9c77f9e` 커밋(이미지 주소 규칙 수정) **이전**의 `01_schema.sql`을 실행했다면, 최신 `supabase/01_schema.sql`을 SQL Editor에서 한 번 더 실행하세요. 기존 데이터는 그대로 두고 주소 형식 제약만 새 규칙으로 바꿉니다. (확실하지 않으면 다시 실행해도 안전합니다)

### 1-2. RLS 점검 SQL

1. `supabase/05_verify_rls.sql`의 `admin_email`을 관리자 이메일로 바꾸기
2. 파일 **전체**를 SQL Editor에 붙여넣고 Run
3. 빨간 ERROR 상자 첫 줄이 **`✅ RLS 점검 통과`** 이면 성공 (이 ERROR는 시험 변경을 되돌리기 위한 정상 동작)

### 1-3. 앱 쪽 연결 점검 명령

`.env`를 만든 뒤 (PowerShell: `copy .env.example .env` → 메모장으로 값 입력):

```bash
npm run check:supabase
```

이 명령은 **조회와 "차단되는지"만 확인하고 데이터를 만들거나 바꾸지 않습니다.** (삭제 차단 시험은 존재할 수 없는 id 하나만 대상으로 합니다)

정상 결과:

```text
✅ 주소 형식: https://….supabase.co
✅ 키 종류: Publishable key (권장)
✅ 방문자 조회: projects 테이블 연결 성공 · 현재 0건
✅ 방문자 삭제 차단: permission denied — 02_policies.sql 의 권한 설정이 적용되어 있습니다.
✅ is_admin 함수: 방문자는 호출할 수 없음 — 02_policies.sql 이 적용되어 있습니다.

결과: 통과 5 · 주의 0 · 실패 0
```

❌·⚠️가 나오면 그 줄의 안내대로 고친 뒤 다시 실행합니다.

## 2단계. 로컬에서 실제 CRUD·권한 테스트

```bash
npm run dev
```

http://localhost:5173 에서 아래 표를 차례로 진행하고 결과를 적어 두세요. 등록·수정·삭제는 **시험용 프로젝트 하나로만** 합니다.

| # | 누구로 | 할 일 | 기대 결과 | 결과 |
| --- | --- | --- | --- | --- |
| 1 | 방문자 | `/projects` | "아직 등록된 프로젝트가 없습니다." (오류 상자 아님) | |
| 2 | 방문자 | 주소창 `/projects/new` | 로그인 화면으로 이동 | |
| 3 | 방문자 | 헤더 | New·Logout 없음, 푸터에 Admin | |
| 4 | — | 로그인 화면에서 틀린 비밀번호 | "이메일 또는 비밀번호가 올바르지 않습니다." | |
| 5 | 관리자 | 올바르게 로그인 | "관리자로 로그인했습니다.", 헤더에 New·Logout | |
| 6 | 관리자 | New → 빈 칸으로 등록하기 | 칸별 오류, 요청 안 보냄 | |
| 7 | 관리자 | 이미지 주소 `//example.com/a.png` | 형식 오류 표시 | |
| 8 | 관리자 | 제목 `CRUD 시험용 (삭제 예정)` 등 채우고 등록 | 상세 화면 + "프로젝트를 등록했습니다." | |
| 9 | — | Supabase **Table Editor → projects** | 방금 만든 행 1개 | |
| 10 | 관리자 | 수정 → 제목 끝에 ` 2` → 저장 | 바뀐 제목 + "프로젝트를 수정했습니다." | |
| 11 | 관리자 | 그 시험용 프로젝트 삭제 → 확인 | 목록 이동 + "프로젝트를 삭제했습니다.", Table Editor에서도 사라짐 | |
| 12 | 관리자 | Logout | 수정·삭제 버튼 사라짐 | |
| 13 | 방문자 | 로그아웃 상태로 `/projects/new` | 로그인 화면으로 이동 | |
| 14 | (선택) 관리자 아닌 계정 | 로그인 → `/projects/new` | "관리자 권한이 없는 계정입니다.", New 없음 | |

- 14번은 Authentication → Users에서 테스트 계정을 만들어(admin_users에는 등록하지 않음) 시험한 뒤 삭제합니다.
- API를 직접 부르는 방문자 시험은 [security-review.md](security-review.md) 4-2를 참고합니다. 반드시 시험용 프로젝트 id 하나만 대상으로 합니다.

## 3단계. Vercel 배포 설정 (승인 후 진행)

### 3-1. 배포할 브랜치 먼저 정하기

현재 GitHub 저장소에는 **main 브랜치가 없고, 기본 브랜치가 작업 브랜치 `claude/epic-clarke-mmra67`** 입니다. Vercel은 기본 브랜치를 Production으로 배포합니다.

| 방법 | 내용 |
| --- | --- |
| A. main 병합 후 배포 (권장) | main 브랜치를 만들어 병합(승인 필요) → GitHub 기본 브랜치를 main으로 → Vercel Production Branch = `main` |
| B. 지금 브랜치로 배포 | Production Branch = `claude/epic-clarke-mmra67`. 나중에 main으로 바꿀 수 있음 |

### 3-2. 프로젝트 가져오기

1. https://vercel.com → **Continue with GitHub** → **Add New… → Project**
2. `beatles12/codyssey-b1-2-react` → **Import** (안 보이면 **Adjust GitHub App Permissions**에서 이 저장소만 허용)
3. 설정값 (대부분 자동 인식, 그대로 두면 됨)

| 항목 | 값 |
| --- | --- |
| Framework Preset | **Vite** |
| Root Directory | `./` (기본값) |
| Build Command | `npm run build` (기본값) |
| Output Directory | `dist` (기본값) |
| Install Command | 기본값 그대로 (`package-lock.json`에 적힌 버전으로 설치) |
| Node.js Version | 22.x 이상 (Vite 8은 Node 20.19+ 또는 22.12+ 필요). 기본값이 이보다 낮으면 Settings → General에서 변경 |

4. **Environment Variables**: 위 표의 이름으로 2~3개 추가. 적용 대상은 **Production**과 **Preview** 모두 체크 (작업 브랜치에 push할 때 만들어지는 미리보기 배포에서도 동작하도록)
5. **Deploy**

| 증상 | 원인 / 해결 |
| --- | --- |
| 빌드 로그에 `[보안] … 비밀키` | 환경변수에 secret/service_role 키를 넣음 → Publishable key로 바꾸고 Redeploy, 그 비밀키는 Supabase에서 폐기 |
| 빌드 로그에 Node 버전 오류 | Settings → General → Node.js Version을 22.x로 |
| 배포 사이트에 "Supabase 연결 정보가 없습니다" | 환경변수 이름·적용 대상 확인 → **Deployments → Redeploy** |
| 새로고침하면 404 | 배포한 브랜치에 `vercel.json`이 있는지 |

### 3-3. Supabase 쪽 (선택)

**Authentication → URL Configuration → Site URL**을 Vercel 주소로 바꿉니다. 이 앱은 이메일·비밀번호 로그인만 써서 필수는 아니지만, 나중에 비밀번호 재설정 메일 등을 쓸 때 필요합니다.

## 4단계. 배포 사이트에서 다시 확인

Vercel 주소(`https://….vercel.app`)에서:

| # | 할 일 | 기대 결과 | 결과 |
| --- | --- | --- | --- |
| 1 | `/projects/아무id` 주소로 직접 접속 후 새로고침 | 404가 아니라 앱 화면 ("찾을 수 없습니다" 안내) | |
| 2 | `/about`에서 새로고침 | About 화면 유지 | |
| 3 | 2단계 표의 1~13번 | 같은 결과 | |
| 4 | 휴대폰으로 접속 | 메뉴·화면 정상 | |
| 5 | (선택) 문의 폼 실제 전송 | "메시지가 정상적으로 전송되었습니다." (실제 메일 발송됨) | |

## 5단계. Claude에게 알려 줄 것 (키·비밀번호는 빼고)

1. `05_verify_rls.sql`의 ERROR 상자 내용 (첫 줄 ✅/❌와 항목별 결과)
2. `npm run check:supabase` 출력
3. 2단계·4단계 표에서 기대와 다른 번호와 화면 문구
4. 배포 방법 선택 (3-1의 A 또는 B)
