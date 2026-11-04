# B1-1 디자인 복원 작업 기록

- 브랜치: `claude/b1-1-design-restore` (Production 브랜치 `claude/epic-clarke-mmra67`에는 **병합하지 않음** — 승인 후 병합)
- 비교 방법: B1-1 원본(로컬 정적 서버)과 B1-2(가짜 API, Supabase 0건 상태와 동일)를 Playwright로 1440 / 768 / 375px에서 전체 화면 촬영·수치 측정
- 비교 이미지: [design-compare/](design-compare/) (왼쪽 B1-1 원본, 오른쪽 B1-2)

## 1. 실제로 확인한 차이 (변경 전)

| 영역 | B1-1 원본 | B1-2 변경 전 | 측정값 |
| --- | --- | --- | --- |
| 섹션 위아래 여백 | `clamp(76px, 6vw, 92px)`, 모바일 위 28px | `--section` 110~125px, 모바일 110px | About 위 여백 1440px: 86 → **125**, 375px: 28 → **110** |
| About 높이 | 724 / 950 / 1259 | 801 / 1034 / 1375 | (1440 / 768 / 375) |
| Expertise 높이 | PC에서 화면 높이(`100svh-80px`), 820 | 662 | 1440px |
| WORK 콘텐츠 | GitHub 공개 저장소 4개 카드 + 언어 필터 | Supabase 0건 → 빈 상자만 | 콘텐츠 없음 |
| 헤더 메뉴 | About · Expertise · Work · Contact | About · Work · Contact | Expertise 없음 |
| `#섹션` 이동 | `scroll-margin-top: 90px` | 없음 → 제목이 헤더에 가려짐 | Expertise top −40px |
| Contact 장식 | 오른쪽 아래 식물 SVG | 없음 | — |
| 하위 페이지 제목 위 공백 | (원본엔 하위 페이지 없음) | 약 200px | — |
| 모바일 전체 길이 | 5185px | 5986px | 375px |
| 같았던 것 | Hero 높이·제목 크기(72.8px / 42.4px), 섹션 제목 크기, 라벤더 색상, 글꼴 스택, 시루·고양이 귀 이미지 위치, 타이핑 리듬 | | |

## 2. 수정한 것 (이 브랜치)

| 문제 | 수정 | 파일 |
| --- | --- | --- |
| 섹션 여백 | 원본과 같은 값으로 복원 (`.about/.skills/.projects`, 화면 크기별 `--section` 76·92·108·125px) | `src/styles/home.css`, `src/styles/global.css` |
| Expertise 높이 | PC `min-height: calc(100svh - 80px)` 복원 | `src/styles/home.css` |
| WORK 비어 있음 | 원본처럼 **GitHub 공개 저장소 카드**를 홈 Work와 `/projects`에 표시. Supabase 관리 프로젝트는 위에, 각각 **출처 라벨**(“직접 관리하는 프로젝트 · Supabase” / “GitHub 공개 저장소 · GitHub API로 자동 표시”)로 구분. Supabase가 0건이면 홈에서는 숨기고, 목록에서는 작은 안내로 표시 | `src/components/project/GithubRepoList.jsx`(새), `FeaturedProjects.jsx`, `GithubSection.jsx`, `ProjectListPage.jsx`, `HomePage.jsx` |
| 헤더 메뉴 | Expertise 추가, 원본 순서 About · Expertise · Work · Contact | `src/components/layout/Header.jsx` |
| 섹션 이동 시 가림 | `section[id] { scroll-margin-top: 90px }` | `src/styles/global.css` |
| Contact 장식 | 원본 식물 SVG 복원 | `ContactSection.jsx`, `home.css` |
| 하위 페이지 공백 | 첫 섹션 위 여백 `clamp(48px, 6vw, 72px)` | `src/styles/global.css` |

- 프로젝트 데이터를 새로 만들거나 Supabase에 넣지 않았습니다. GitHub 카드는 GitHub API가 주는 공개 정보와 B1-1에 있던 설명만 씁니다.
- Supabase SQL, 인증·RLS, CRUD API는 변경하지 않았습니다.

## 3. 변경 후 측정

| | B1-1 | B1-2 변경 후 |
| --- | --- | --- |
| About 높이 (1440 / 768 / 375) | 724 / 950 / 1259 | **724 / 950 / 1259** (같음) |
| Expertise 높이 (1440 / 768 / 375) | 820 / 845 / 1338 | **820 / 845 / 1338** (같음) |
| About 위 여백 (1440 / 375) | 86 / 28 | **86 / 28** (같음) |
| Expertise 메뉴 이동 후 섹션 위치 | 헤더 아래 | 헤더 아래 (top 50px) |

## 4. 검증

- 자동 테스트 191개 통과, lint 0, build 성공
- 브라우저 점검 46개 중 45개 통과 (가짜 API): 등록·수정·삭제, 연속 클릭, 관리자 아닌 계정, 모바일 메뉴, 새로고침, 가로 넘침 없음(1440/1024/768/375), 콘솔 오류 0
  - 실패 1개는 점검 스크립트 타이밍 문제: 기다리던 카드 제목이 GitHub 목록에도 생겨 Supabase 목록이 뜨기 전에 Tab 순서를 측정함 (앱 동작 문제 아님)
- 메뉴 → Expertise 이동, 브라우저 뒤로 가기 2단계, 다크 모드 Contact 대비 확인
- 이 작업 환경은 GitHub API 요청 한도(IP 기준 시간당 60회)에 걸릴 때가 있어, 카드 화면은 실제 응답과 같은 형식의 가로챈 응답으로도 확인함 (원본 B1-1도 실패 시 같은 오류 문구를 보여줌)

## 5. 남은 차이와 다음 작업 제안

| 남은 차이 | 상태 | 제안 |
| --- | --- | --- |
| WORK 카드 그림: 원본은 카드마다 HTML로 그린 **미니 일러스트**(가계부·NPU·퀴즈·터미널)를 기본으로 보여주고 마우스를 올리면 실제 캡처로 바뀜. B1-2는 처음부터 캡처 이미지 | 미해결 | 원본 `getProjectVisual`의 마크업·CSS(약 250줄)를 GitHub 카드 전용으로 이식 |
| WORK 머리말 배치: 원본은 제목 왼쪽, 개수·언어 필터 오른쪽(2열) | 미해결 | GitHub 목록에 언어 필터 추가 여부를 결정 후 `project-heading` 2열 배치 이식 |
| Hero 높이 375px: 원본 1068 vs B1-2 1138 | 미해결 (작음) | 모바일 `hero-stage` 높이(590px) 재조정 |
| 768px WORK 높이 차이 | GitHub 응답 유무에 따라 달라 측정 불가 | 실제 배포 화면에서 다시 비교 |
| 768px·375px 화면 스크린샷 육안 비교 | 수치 비교만 완료 | 배포 미리보기에서 확인 |

## 6. 병합 전 확인할 것 (소유자)

1. Vercel이 이 브랜치를 **Preview**로 배포했다면 그 주소에서 홈·About·Work·Contact를 원본과 비교
2. 괜찮으면 Production 브랜치로 병합 승인 → 병합하면 Production에 자동 배포됨
