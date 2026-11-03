import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import * as authApi from "../lib/authApi.js";
import * as api from "../lib/projectsApi.js";
import { adminSession, memberSession, setMockSession } from "../test/authMock.js";
import { mockProjects } from "../test/mockProjects.js";
import { renderWithProviders } from "../test/renderWithProviders.jsx";

// 화면 쪽 권한 처리와 악성 입력 방어를 가짜 API로 검증한다. (실제 RLS 검증은 docs/security-review.md 절차로 따로 해야 한다)
vi.mock("../lib/projectsApi.js");
vi.mock("../lib/authApi.js");

const [project] = mockProjects;
const renderAt = route => renderWithProviders(<App />, { route });

beforeEach(() => {
  api.fetchProjects.mockResolvedValue(mockProjects);
  api.fetchProjectById.mockResolvedValue(project);
});

describe("관리자가 아닌 로그인 계정", () => {
  beforeEach(() => setMockSession(memberSession));

  it("관리 버튼(New·등록·수정·삭제)이 보이지 않는다", async () => {
    renderAt(`/projects/${project.id}`);
    expect(await screen.findByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "New" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "수정" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
  });

  it.each(["/projects/new", `/projects/${project.id}/edit`])("%s 에 직접 들어가면 권한 없음 안내를 보여준다", async path => {
    renderAt(path);
    expect(await screen.findByRole("alert")).toHaveTextContent("관리자 권한이 없는 계정입니다.");
    expect(screen.queryByLabelText(/TITLE/)).not.toBeInTheDocument();
  });

  it("관리자 확인(is_admin) 요청이 실패하면 관리자가 아닌 것으로 처리한다", async () => {
    setMockSession(adminSession);
    authApi.checkIsAdmin.mockRejectedValue(new Error("function is_admin does not exist"));
    renderAt("/projects/new");
    expect(await screen.findByRole("alert")).toHaveTextContent("관리자 권한이 없는 계정입니다.");
  });
});

describe("관리자 로그아웃 후", () => {
  it("관리 버튼이 사라지고, 보호된 주소로 가면 로그인 화면으로 보낸다", async () => {
    const changeSession = setMockSession(adminSession);
    authApi.signOut.mockImplementation(async () => changeSession(null));
    const user = userEvent.setup();
    renderAt(`/projects/${project.id}/edit`);

    expect(await screen.findByLabelText(/TITLE/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: `${project.title} 상세 보기` }));
    expect(await screen.findByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "수정" })).not.toBeInTheDocument();
  });
});

describe("연속 클릭 방지", () => {
  beforeEach(() => setMockSession(adminSession));

  it("등록 버튼을 빠르게 두 번 눌러도 한 번만 저장한다", async () => {
    api.createProject.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    renderAt("/projects/new");

    await user.type(await screen.findByLabelText(/TITLE/), "제목");
    await user.type(screen.getByLabelText(/SUMMARY/), "요약");
    await user.type(screen.getByLabelText(/DESCRIPTION/), "설명");
    await user.dblClick(screen.getByRole("button", { name: /등록하기/ }));

    expect(api.createProject).toHaveBeenCalledTimes(1);
  });

  it("삭제 확인을 두 번 눌러도 한 번만 삭제한다", async () => {
    api.deleteProject.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    renderAt(`/projects/${project.id}`);

    await user.click(await screen.findByRole("button", { name: "삭제" }));
    await user.dblClick(within(screen.getByRole("dialog")).getByRole("button", { name: "삭제" }));

    expect(api.deleteProject).toHaveBeenCalledTimes(1);
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "삭제 중..." })).toBeDisabled();
  });
});

describe("악성 입력 방어", () => {
  const evilProject = {
    ...project,
    title: '<img src=x onerror="alert(1)">',
    description: "<script>alert('xss')</script>",
    githubUrl: "javascript:alert(1)",
    demoUrl: "https://demo.example.com",
    imageUrl: "javascript:alert(2)",
  };

  it("HTML은 글자로만 보이고, 위험한 링크·이미지 주소는 표시하지 않는다", async () => {
    setMockSession(null);
    api.fetchProjectById.mockResolvedValue(evilProject);
    const { container } = renderAt(`/projects/${project.id}`);

    expect(await screen.findByRole("heading", { level: 1, name: evilProject.title })).toBeInTheDocument();
    expect(screen.getByText(evilProject.description)).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector('img[src^="javascript"], img[src="x"]')).toBeNull();
    expect(screen.queryByRole("link", { name: "GitHub" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute("href", "https://demo.example.com");
  });

  it("목록 카드에서도 위험한 이미지 주소는 쓰지 않는다", async () => {
    setMockSession(null);
    api.fetchProjects.mockResolvedValue([evilProject]);
    const { container } = renderAt("/projects");

    expect(await screen.findByRole("heading", { name: evilProject.title })).toBeInTheDocument();
    expect(container.querySelector(".project-visual img")).toBeNull();
  });
});

describe("영어 모드의 공통 버튼 문구", () => {
  it("오류 화면의 다시 시도 버튼도 영어로 바뀐다", async () => {
    setMockSession(null);
    localStorage.setItem("portfolio-language", "en");
    api.fetchProjects.mockRejectedValue(new TypeError("Failed to fetch"));
    renderAt("/projects");

    expect(await screen.findByRole("alert")).toHaveTextContent("Cannot reach the network.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("삭제 확인 창의 취소 버튼도 영어로 바뀐다", async () => {
    setMockSession(adminSession);
    localStorage.setItem("portfolio-language", "en");
    const user = userEvent.setup();
    renderAt(`/projects/${project.id}`);

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    await act(async () => {});
  });
});
