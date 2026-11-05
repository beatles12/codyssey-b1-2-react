import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import * as api from "./lib/projectsApi.js";
import { adminSession, setMockSession } from "./test/authMock.js";
import { mockProjects } from "./test/mockProjects.js";
import { renderWithProviders } from "./test/renderWithProviders.jsx";

vi.mock("./lib/projectsApi.js");
vi.mock("./lib/authApi.js");

const [firstProject] = mockProjects;
const renderAt = route => renderWithProviders(<App />, { route });

describe("라우팅", () => {
  beforeEach(() => {
    setMockSession(adminSession);
    api.fetchProjects.mockResolvedValue(mockProjects);
    api.fetchProjectById.mockResolvedValue(firstProject);
  });

  it.each([
    ["/", "불편함 속에서 서비스는 시작됩니다."],
    ["/about", "사람을 이해하는 마음에서 좋은 서비스가 시작됩니다."],
    ["/projects", "Projects"],
    ["/projects/new", "새 프로젝트 등록"],
    [`/projects/${firstProject.id}`, firstProject.title],
    [`/projects/${firstProject.id}/edit`, "프로젝트 수정"],
  ])("%s 경로에서 해당 페이지를 보여준다", async (path, title) => {
    renderAt(path);
    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });

  it("없는 주소는 Not Found 페이지를 보여준다", () => {
    renderAt("/no-such-page");
    expect(screen.getByRole("heading", { name: "페이지를 찾을 수 없습니다." })).toBeInTheDocument();
  });

  it("모든 페이지에 공통 헤더와 푸터가 있다", () => {
    renderAt("/about");
    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("메뉴는 B1-1처럼 홈의 섹션(#)으로 이동하는 링크 4개이고, 홈의 버튼으로 /projects에 들어간다", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const menu = within(document.querySelector("#nav-menu"));
    expect(menu.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(["/#about", "/#expertise", "/#work", "/#contact"]);

    await user.click(menu.getByRole("link", { name: "Work" }));
    expect(screen.getByRole("heading", { level: 1, name: "불편함 속에서 서비스는 시작됩니다." })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /전체 프로젝트 보기/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
  });

  it("메뉴 버튼을 누르면 모바일 메뉴가 열리고 닫힌다", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const toggle = screen.getByRole("button", { name: "메뉴 열기" });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#nav-menu")).toHaveClass("active");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

describe("맨 위로 버튼", () => {
  it("300px 넘게 스크롤하면 나타난다", async () => {
    setMockSession(null);
    renderAt("/about");
    const button = screen.getByRole("button", { name: "페이지 맨 위로 이동", hidden: true });
    expect(button).not.toHaveClass("visible");

    window.scrollY = 400;
    window.dispatchEvent(new Event("scroll"));

    expect(await screen.findByRole("button", { name: "페이지 맨 위로 이동" })).toHaveClass("visible");
    window.scrollY = 0;
  });
});
