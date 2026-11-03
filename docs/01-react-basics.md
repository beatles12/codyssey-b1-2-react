# 01. React 핵심 개념 — 이 프로젝트 코드로 배우기

> 읽는 순서: START_HERE → 00 개요 → **01(이 문서)** → 02 구조 → 03 데이터 흐름 → 04 실행·테스트 → 05 요구사항

## 1. React와 기존 JavaScript(B1-1)의 차이

B1-1에서는 "화면을 어떻게 바꿀지"를 직접 명령했습니다.

```js
// B1-1 (명령형): 상태를 바꾼 뒤, DOM을 직접 찾아서 고친다
STATE.menuOpen = !STATE.menuOpen;
navMenu.classList.toggle("active", STATE.menuOpen);
menuToggle.setAttribute("aria-expanded", String(STATE.menuOpen));
```

React에서는 "상태가 이러면 화면은 이렇게 생겼다"만 적습니다. 상태가 바뀌면 React가 알아서 화면을 다시 그립니다.

```jsx
// B1-2 (선언형): src/components/layout/Header.jsx
const [isMenuOpen, setIsMenuOpen] = useState(false);
<ul className={`nav-menu${isMenuOpen ? " active" : ""}`}>
<button aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(open => !open)}>
```

| 비교 | B1-1 (순수 JS) | B1-2 (React) |
| --- | --- | --- |
| 화면 변경 | `querySelector` + `innerHTML`·`classList` 직접 수정 | state만 바꾸면 React가 다시 그림 |
| 화면 단위 | HTML 파일 1개 + 섹션 | 컴포넌트(함수) 여러 개를 조립 |
| 페이지 이동 | `#about` 같은 같은 페이지 안 이동 | React Router로 `/about`, `/projects/:id` 등 실제 주소 전환 (새로고침 없음 = SPA) |
| 다국어 | CSS 선택자마다 `innerHTML` 교체 | `t("hero.title")` 함수가 현재 언어 문구를 돌려줌 |
| 데이터 | GitHub API 결과를 문자열 HTML로 조립 | 데이터 배열을 `map`으로 컴포넌트에 넘김 |
| XSS 방지 | `escapeHtml` 함수를 직접 만들어 사용 | JSX가 글자를 자동으로 안전하게 처리 |

**SPA(Single Page Application)**: HTML은 `index.html` 하나뿐이고, 주소가 바뀔 때 서버에서 새 페이지를 받지 않고 React가 화면만 갈아 끼우는 방식입니다.

## 2. 컴포넌트

컴포넌트는 **화면 조각을 돌려주는 함수**입니다. 이름은 대문자로 시작합니다.

```jsx
// src/components/ui/LoadingState.jsx
function LoadingState({ message = "불러오는 중입니다." }) {
  return (
    <div className="state-box" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
```

쓰는 쪽에서는 HTML 태그처럼 씁니다: `<LoadingState message="프로젝트를 불러오는 중입니다." />`

**이 프로젝트에서 컴포넌트를 나눈 기준**

1. **두 곳 이상에서 같은 모양이 반복되면** 분리 → `Button`, `FormField`, `ProjectCard`
2. **역할이 다르면** 분리 → 페이지(`pages/`: 데이터를 가져오고 상태를 관리) vs UI(`components/`: 받은 props를 그리기만)
3. **같은 패턴은 하나로 통일** → 로딩/오류/빈 상태는 `DataStatus` 하나만 사용

## 3. props — 부모가 자식에게 주는 값

props는 **읽기 전용 입력값**입니다. 자식은 props를 바꿀 수 없습니다.

```jsx
// 부모: src/pages/ProjectListPage.jsx
<FilterBar options={filterOptions} value={category} onChange={setCategory} label="프로젝트 분류 필터" />

// 자식: src/components/ui/FilterBar.jsx
function FilterBar({ options, value, onChange, label }) {
  ...
  <button aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
```

- `value`처럼 **값**을 내려줄 수도 있고
- `onChange`처럼 **함수**를 내려줘서, 자식이 "버튼이 눌렸어요"라고 부모에게 알리게 할 수도 있습니다.

데이터는 위에서 아래로(props), 이벤트는 아래에서 위로(콜백 함수) 흐릅니다.

## 4. state — 컴포넌트가 기억하는 값

state는 **바뀌면 화면이 다시 그려지는 값**입니다.

```jsx
const [category, setCategory] = useState("all");
//     현재 값    바꾸는 함수         처음 값
```

| props | state |
| --- | --- |
| 부모가 준다 | 컴포넌트가 스스로 가진다 |
| 자식은 못 바꾼다 | `setXxx`로만 바꾼다 |
| 예: `ProjectCard`의 `project` | 예: `ProjectListPage`의 `category` |

### 상태를 어디에 두었나 (상향/하향 흐름)

| 상태 | 위치 | 이유 |
| --- | --- | --- |
| 필터 선택값 `category` | `ProjectListPage` | 필터 버튼(`FilterBar`)과 카드 목록(`ProjectList`) **둘 다** 이 값이 필요 → 공통 부모에 둠 (상태 끌어올리기) |
| 폼 입력값 `values`, 오류 `errors` | `ProjectForm` | 폼과 미리보기만 쓰므로 폼 안에 둠 |
| 목록·상세 데이터, 로딩, 오류 | 커스텀 훅(`useProjects`, `useProject`) | 여러 페이지가 같은 방식으로 불러오므로 훅으로 분리 |
| 저장 중 `isSubmitting` | `useProjectActions` | 등록·수정·삭제가 같은 방식이므로 훅으로 분리 |
| 테마·언어·로그인·알림 | Context | 거의 모든 화면이 필요 → 전역 |
| 모바일 메뉴 열림 `isMenuOpen` | `Header` | 헤더만 씀 |

### controlled input (제어 컴포넌트)

입력칸의 값을 state가 쥐고 있는 방식입니다. 입력할 때마다 state가 바뀌고, state가 입력칸에 다시 표시됩니다.

```jsx
// src/components/project/ProjectForm.jsx
const [values, setValues] = useState(initialValues);
const handleChange = event => {
  const { name, value } = event.target;
  setValues({ ...values, [name]: value });   // 기존 값을 복사하고 바뀐 칸만 덮어씀
};
<FormField name="title" value={values.title} onChange={handleChange} />
```

`{ ...values }`로 **새 객체를 만들어야** React가 "바뀌었다"고 알아챕니다. `values.title = "x"`처럼 직접 고치면 화면이 바뀌지 않습니다.

## 5. useEffect — 화면을 그린 "뒤에" 할 일

`useEffect(할 일, [의존성])`

- 컴포넌트가 화면에 처음 나타난 뒤 실행되고
- 의존성 배열 안의 값이 **바뀔 때마다** 다시 실행됩니다.
- 함수를 `return`하면 다음 실행 전이나 화면에서 사라질 때 정리(clean-up)합니다.

| 의존성 배열 | 언제 실행? | 이 프로젝트의 예 |
| --- | --- | --- |
| `[]` | 처음 한 번 | `AuthContext` — 앱 시작 시 저장된 로그인 확인, 로그인 변화 구독 |
| `[theme]` | theme이 바뀔 때마다 | `ThemeContext` — `<html data-theme>`에 적용 |
| `[language]` | 언어가 바뀔 때마다 | `LanguageContext` — `<html lang>`, localStorage 저장 |
| `[loadData, reloadCount]` | 불러올 대상이 바뀌거나 "다시 시도"를 누를 때 | `useAsyncData` — 데이터 요청 |
| `[pathname, hash]` | 주소가 바뀔 때마다 | `Layout` — 맨 위로 스크롤 |
| `[message, duration, onClose]` | 알림 문구가 생길 때 | `Toast` — 3초 뒤 자동 닫기 |

### useEffect와 데이터 요청 (가장 중요)

```jsx
// src/hooks/useAsyncData.js (요약)
useEffect(() => {
  let isCurrent = true;                 // 이 요청이 아직 "최신"인지
  loadData()
    .then(data => isCurrent && save(data, ""))
    .catch(error => isCurrent && save(null, toErrorKey(error)));
  return () => { isCurrent = false; };  // 다른 요청이 시작되면 이전 결과는 버림
}, [loadData, reloadCount]);
```

- 상세 화면에서 `/projects/A` → `/projects/B`로 이동하면 `id`가 바뀌고 → `loadData`가 바뀌고 → effect가 다시 실행되어 B를 불러옵니다.
- A의 응답이 늦게 도착해도 `isCurrent = false`라서 B 화면을 덮어쓰지 않습니다.
- 정리 함수가 없다면? 느린 이전 응답이 화면을 잘못 바꾸는 버그가 생깁니다.

### 왜 컴포넌트 본문에서 바로 fetch하지 않나요?

컴포넌트 함수는 화면을 그릴 때마다(state가 바뀔 때마다) 다시 실행됩니다. 거기서 요청하면 요청 → state 변경 → 다시 그림 → 또 요청… 무한 반복이 됩니다. useEffect는 "그린 뒤, 의존성이 바뀔 때만" 실행되므로 안전합니다.

## 6. 비동기 상태 4가지: 로딩 / 성공 / 실패 / 빈 데이터

`useAsyncData`는 `{ data, isLoading, error, reload }`를 돌려주고, 화면은 `DataStatus`가 하나만 골라 그립니다.

```jsx
// src/components/ui/DataStatus.jsx
if (isLoading) return <LoadingState message={loadingMessage} />;
if (error) return <ErrorState message={error} onRetry={onRetry} />;
if (isEmpty) return <EmptyState message={emptyMessage} action={emptyAction} />;
return children;   // 성공
```

모든 데이터 화면(홈 Work, 목록, 상세, 수정, GitHub)이 이 컴포넌트를 거치므로 표시 방식이 일관됩니다.

## 7. Context — 전역 상태

props를 여러 단계로 계속 내려주는 대신, 앱 전체가 꺼내 쓸 수 있는 공용 보관함입니다.

```text
AppProviders
└ ThemeProvider      → useTheme()     : mode, theme, toggleTheme, selectAutoTheme
  └ LanguageProvider → useLanguage()  : language, t, messages, toggleLanguage
    └ ToastProvider  → useToast()     : showToast(message, type)
      └ AuthProvider → useAuth()      : user, isAdmin, isLoading, signIn, signOut
        └ App (모든 페이지)
```

예: 헤더의 Dark 버튼 → `toggleTheme()` → ThemeContext의 state 변경 → `data-theme` 변경 → 모든 화면 색이 CSS 변수로 한꺼번에 바뀜.

`ToastContext`가 전역인 이유: 저장에 성공하면 상세 화면으로 **이동**합니다. 알림이 등록 페이지 안에 있으면 이동과 함께 사라지므로, 페이지 바깥(전역)에 둡니다.

## 8. 커스텀 훅 — 상태 로직 재사용

`use`로 시작하는 함수로, 다른 훅(useState, useEffect…)을 묶어 재사용합니다.

| 훅 | 돌려주는 값 | 왜 분리했나 |
| --- | --- | --- |
| `useAsyncData(loadData)` | data, isLoading, error, reload | 로딩·오류·재시도·늦은 응답 무시 로직을 한 곳에만 작성 |
| `useProjects()` | projects, isLoading, error, reload | 홈 Work와 목록 페이지가 같은 데이터를 씀 |
| `useProject(id)` | project, isLoading, error, reload | 상세·수정 페이지가 같은 방식으로 한 건을 씀 |
| `useProjectActions()` | create, update, remove, isSubmitting, error | 등록·수정·삭제의 "저장 중 / 실패 / 연속 클릭 잠금" 처리가 같음 |
| `useGithubRepos()` | repos, isLoading, error, reload | GitHub API를 화면 코드와 분리 |
| `useInView()` | [ref, isInView] | 등장 효과·타이핑 시작 시점을 여러 섹션이 공유 |
| `useTypingEffect(text, isActive)` | 지금까지 타이핑된 문자열 | B1-1 타이핑 리듬을 React 방식으로 |
| `useScrolled(offset)` | 스크롤 여부 | 헤더 배경, 맨 위로 버튼 |
| `useTheme / useLanguage / useToast / useAuth` | Context 값 | Provider 밖에서 쓰면 바로 알 수 있게 오류 처리 |

**훅으로 분리하면 좋은 점**: 페이지 코드는 "무엇을 보여줄지"에만 집중하고, "어떻게 불러올지"는 훅이 맡습니다. 테스트도 따로 할 수 있습니다(`src/hooks/projectHooks.test.jsx`).

## 9. 메모이제이션 (보너스 과제)

- `useMemo`: 필터링 결과를 `projects`나 `category`가 바뀔 때만 다시 계산 (`ProjectListPage`, `FeaturedProjects`)
- `useCallback`: 함수를 매번 새로 만들지 않게 고정. `useProject`의 `loadProject`가 고정돼야 useEffect가 불필요하게 다시 요청하지 않습니다.
- Context 값은 `useMemo`로 묶어, 관련 없는 렌더링 때 모든 화면이 다시 그려지지 않게 했습니다.
