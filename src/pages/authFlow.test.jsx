import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import * as authApi from "../lib/authApi.js";
import * as api from "../lib/projectsApi.js";
import { adminSession, setMockSession } from "../test/authMock.js";
import { mockProjects } from "../test/mockProjects.js";
import { renderWithProviders } from "../test/renderWithProviders.jsx";

vi.mock("../lib/projectsApi.js");
vi.mock("../lib/authApi.js");

const [project] = mockProjects;
const renderAt = route => renderWithProviders(<App />, { route });

beforeEach(() => {
  api.fetchProjects.mockResolvedValue(mockProjects);
  api.fetchProjectById.mockResolvedValue(project);
});

describe("방문자 (로그인 안 함)", () => {
  beforeEach(() => setMockSession(null));

  it("목록은 볼 수 있지만 등록 버튼은 없다", async () => {
    renderAt("/projects");
    expect(await screen.findByRole("heading", { name: project.title })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /새 프로젝트 등록/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "New" })).not.toBeInTheDocument();
  });

  it("상세는 볼 수 있지만 수정·삭제 버튼은 없다", async () => {
    renderAt(`/projects/${project.id}`);
    expect(await screen.findByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "수정" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
  });

  it.each(["/projects/new", `/projects/${project.id}/edit`])("%s 에 직접 들어가면 로그인 화면으로 보낸다", async path => {
    renderAt(path);
    expect(await screen.findByRole("heading", { level: 1, name: "관리자 로그인" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/TITLE/)).not.toBeInTheDocument();
  });

  it("푸터의 Admin 링크로 로그인 화면에 갈 수 있다", async () => {
    renderAt("/");
    expect(await screen.findByRole("link", { name: "Admin" })).toHaveAttribute("href", "/login");
  });
});

describe("로그인 화면 (/login)", () => {
  beforeEach(() => setMockSession(null));

  it("빈 칸이면 요청하지 않고 오류를 보여준다", async () => {
    const user = userEvent.setup();
    renderAt("/login");

    await user.click(await screen.findByRole("button", { name: /로그인/ }));

    expect(screen.getByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(authApi.signInWithPassword).not.toHaveBeenCalled();
  });

  it("비밀번호가 틀리면 실패 이유를 보여준다", async () => {
    authApi.signInWithPassword.mockRejectedValue({ code: "invalid_credentials", message: "Invalid login credentials" });
    const user = userEvent.setup();
    renderAt("/login");

    await user.type(await screen.findByLabelText(/EMAIL/), "admin@example.com");
    await user.type(screen.getByLabelText(/PASSWORD/), "wrong-password");
    await user.click(screen.getByRole("button", { name: /로그인/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("이메일 또는 비밀번호가 올바르지 않습니다.");
    expect(screen.getByRole("button", { name: /로그인/ })).toBeEnabled();
  });

  it("보호된 화면에서 왔다면 로그인 성공 후 그 화면으로 돌아간다", async () => {
    const changeSession = setMockSession(null);
    let finishLogin;
    authApi.signInWithPassword.mockImplementation(() => new Promise(resolve => (finishLogin = resolve)));
    const user = userEvent.setup();
    renderAt("/projects/new");

    await user.type(await screen.findByLabelText(/EMAIL/), "admin@example.com");
    await user.type(screen.getByLabelText(/PASSWORD/), "secret-password");
    await user.click(screen.getByRole("button", { name: /로그인/ }));
    expect(screen.getByRole("button", { name: "로그인 중..." })).toBeDisabled();

    await act(async () => {
      changeSession(adminSession);
      finishLogin(adminSession);
    });

    expect(await screen.findByRole("heading", { level: 1, name: "새 프로젝트 등록" })).toBeInTheDocument();
    expect(screen.getByText("관리자로 로그인했습니다.")).toBeInTheDocument();
    expect(authApi.signInWithPassword).toHaveBeenCalledWith("admin@example.com", "secret-password");
  });
});

describe("관리자 (로그인함)", () => {
  it("헤더에 New·Logout이 보이고, 로그아웃하면 관리 버튼이 사라진다", async () => {
    const changeSession = setMockSession(adminSession);
    authApi.signOut.mockImplementation(async () => changeSession(null));
    const user = userEvent.setup();
    renderAt("/projects");

    expect(await screen.findByRole("link", { name: "New" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /새 프로젝트 등록/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(await screen.findByText("로그아웃했습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "New" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /새 프로젝트 등록/ })).not.toBeInTheDocument();
  });
});
