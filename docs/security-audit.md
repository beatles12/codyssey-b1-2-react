# 보안 점검 기록

공개 배포 전에 이 문서의 **배포 전 체크리스트**를 다시 확인합니다.

## 1. npm audit 경고 (1단계에서 발견)

| 항목 | 내용 |
| --- | --- |
| 발견일 | 2026-11-03 (1단계). 2단계·7단계 완료 후(Supabase 라이브러리 추가 후) 다시 확인 — 변화 없음 |
| 결과 | moderate 6건, high/critical 0건 |
| 원인 패키지 | `minimatch` (< 11.0.1) — ReDoS(정규식 서비스 거부) 가능성, [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) |
| 경로 | `eslint` → `@eslint/config-array` → `minimatch` (나머지 5건은 이 체인에 딸린 eslint 관련 패키지) |
| 영향 범위 | **개발용 코드 검사 도구(ESLint)에만 포함.** `npm run build` 결과물(`dist/`)에는 들어가지 않으므로 방문자가 보는 사이트에는 영향이 없음 |
| 수정 가능 여부 | 기록 시점에 수정판 없음 (`No fix available`). `npm audit fix --force`는 테스트를 깨뜨릴 수 있는 무리한 변경이라 적용하지 않음 |
| 조치 | 공개 배포 전에 `npm audit`를 다시 실행하고, 수정판이 나왔으면 일반 업데이트로 반영 |

확인 명령:

```bash
npm audit
npm audit --omit=dev   # 실제 사이트에 들어가는 패키지만 검사 (0건이어야 함)
```

## 2. 비밀값 점검 (7단계 완료 시점)

| 항목 | 결과 |
| --- | --- |
| 코드에 Supabase URL·키 | 없음. `import.meta.env.VITE_SUPABASE_*`로만 읽음 |
| 코드에 비밀번호 | 없음. 관리자 비밀번호는 Supabase 대시보드에서만 설정 |
| `service_role` 키 사용 | 없음 |
| Formspree 폼 ID `mvkzqbrk` | 코드에 기본값으로 있음. B1-1 공개 사이트에 이미 노출된 **공개 식별자**이며 비밀키가 아님. `VITE_FORMSPREE_ID`로 바꿀 수 있음 |
| `.env` 커밋 여부 | `.gitignore`로 제외, `.env.example`만 커밋 |

## 3. 배포 전 체크리스트

- [ ] `npm audit --omit=dev` 결과 0건
- [ ] `npm audit` 재확인, 수정판이 있으면 반영 후 테스트 통과
- [ ] `.env`가 Git에 올라가지 않았는지 확인 (`git ls-files | grep .env` → `.env.example`만 나와야 함)
- [ ] 코드에 Supabase `service_role` 키·관리자 비밀번호가 없는지 확인
- [ ] Supabase RLS 활성화: 방문자는 조회만, 관리자만 등록·수정·삭제 가능한지 **실제로 시험**
- [ ] Supabase Auth 공개 회원가입 비활성화
- [ ] Vercel 환경변수 등록 후 배포 URL에서 CRUD 확인
