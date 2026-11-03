import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { AppError } from "../lib/errors.js";
import * as api from "../lib/projectsApi.js";
import { adminSession, setMockSession } from "../test/authMock.js";
import { mockProjects } from "../test/mockProjects.js";
import { renderWithProviders } from "../test/renderWithProviders.jsx";

// 실제 Supabase 대신 가짜 API(Mock)로 화면 흐름만 검증한다. 기본은 관리자로 로그인한 상태.
vi.mock("../lib/projectsApi.js");
vi.mock("../lib/authApi.js");

beforeEach(() => setMockSession(adminSession));

const [aiProject, eduProject] = mockProjects;
const renderAt = route => renderWithProviders(<App />, { route });

describe("목록 화면 (/projects)", () => {
  it("로딩 → 카드 목록, 필터를 바꾸면 목록과 개수가 바뀐다", async () => {
    api.fetchProjects.mockResolvedValue(mockProjects);
    const user = userEvent.setup();
    renderAt("/projects");

    expect(screen.getByText("프로젝트를 불러오는 중입니다.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: aiProject.title })).toBeInTheDocument();
    expect(screen.getByText("2개의 프로젝트를 표시하고 있습니다.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "교육" }));

    expect(screen.queryByRole("heading", { name: aiProject.title })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: eduProject.title })).toBeInTheDocument();
    expect(screen.getByText("1개의 프로젝트를 표시하고 있습니다.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "창업" }));
    expect(screen.getByText("이 분류에 해당하는 프로젝트가 없습니다.")).toBeInTheDocument();
  });

  it("데이터가 없으면 빈 상태와 등록 버튼을 보여준다", async () => {
    api.fetchProjects.mockResolvedValue([]);
    renderAt("/projects");
    expect(await screen.findByText("아직 등록된 프로젝트가 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /새 프로젝트 등록/ })).toHaveAttribute("href", "/projects/new");
  });

  it("Supabase 설정이 없으면 원인을 알려 주고 다시 시도할 수 있다", async () => {
    api.fetchProjects.mockRejectedValueOnce(new AppError("config")).mockResolvedValueOnce(mockProjects);
    const user = userEvent.setup();
    renderAt("/projects");

    expect(await screen.findByRole("alert")).toHaveTextContent("Supabase 연결 정보가 없습니다");
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByRole("heading", { name: aiProject.title })).toBeInTheDocument();
  });

  it("카드를 누르면 상세 화면으로 이동한다", async () => {
    api.fetchProjects.mockResolvedValue(mockProjects);
    api.fetchProjectById.mockResolvedValue(aiProject);
    const user = userEvent.setup();
    renderAt("/projects");

    await user.click(await screen.findByRole("link", { name: `${aiProject.title} 상세 보기` }));

    expect(await screen.findByRole("heading", { level: 1, name: aiProject.title })).toBeInTheDocument();
    expect(api.fetchProjectById).toHaveBeenCalledWith(aiProject.id);
  });
});

describe("상세 화면 (/projects/:id)", () => {
  it("라우트 파라미터로 불러온 정보를 보여준다", async () => {
    api.fetchProjectById.mockResolvedValue(aiProject);
    renderAt(`/projects/${aiProject.id}`);

    expect(await screen.findByText(aiProject.description)).toBeInTheDocument();
    expect(screen.getByText(aiProject.role)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", aiProject.githubUrl);
  });

  it("없는 프로젝트면 안내만 보여주고 다시 시도 버튼은 없다", async () => {
    api.fetchProjectById.mockRejectedValue(new AppError("notFound"));
    renderAt("/projects/unknown");

    expect(await screen.findByRole("alert")).toHaveTextContent("프로젝트를 찾을 수 없습니다.");
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("삭제 확인 후 삭제하면 알림과 함께 목록으로 이동한다", async () => {
    api.fetchProjectById.mockResolvedValue(aiProject);
    api.deleteProject.mockResolvedValue();
    api.fetchProjects.mockResolvedValue([eduProject]);
    const user = userEvent.setup();
    renderAt(`/projects/${aiProject.id}`);

    await user.click(await screen.findByRole("button", { name: "삭제" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(`“${aiProject.title}” 프로젝트를 삭제하면 되돌릴 수 없습니다.`);
    await user.click(within(dialog).getByRole("button", { name: "삭제" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText("프로젝트를 삭제했습니다.")).toBeInTheDocument();
    expect(api.deleteProject).toHaveBeenCalledWith(aiProject.id);
    expect(await screen.findByRole("heading", { name: eduProject.title })).toBeInTheDocument();
  });

  it("삭제가 거절되면(RLS) 상세 화면에 머물며 실패 이유를 보여준다", async () => {
    api.fetchProjectById.mockResolvedValue(aiProject);
    api.deleteProject.mockRejectedValue(new AppError("notChanged"));
    const user = userEvent.setup();
    renderAt(`/projects/${aiProject.id}`);

    await user.click(await screen.findByRole("button", { name: "삭제" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "삭제" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("변경되지 않았습니다");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: aiProject.title })).toBeInTheDocument();
  });

  it("삭제 확인 창에서 취소하면 삭제하지 않는다", async () => {
    api.fetchProjectById.mockResolvedValue(aiProject);
    const user = userEvent.setup();
    renderAt(`/projects/${aiProject.id}`);

    await user.click(await screen.findByRole("button", { name: "삭제" }));
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(api.deleteProject).not.toHaveBeenCalled();
  });
});

describe("등록 화면 (/projects/new)", () => {
  it("필수값이 비면 제출하지 않고 필드 옆에 오류를 보여준다", async () => {
    const user = userEvent.setup();
    renderAt("/projects/new");
    await screen.findByLabelText(/TITLE/);

    await user.click(screen.getByRole("button", { name: /등록하기/ }));

    expect(screen.getByText("입력값을 확인해 주세요.")).toBeInTheDocument();
    expect(screen.getByLabelText(/TITLE/)).toHaveAccessibleDescription("제목을 입력해 주세요.");
    expect(screen.getByLabelText(/SUMMARY/)).toHaveAccessibleDescription("한 줄 소개를 입력해 주세요.");
    expect(api.createProject).not.toHaveBeenCalled();
  });

  it("입력하면 미리보기 카드와 글자 수가 바로 바뀐다", async () => {
    const user = userEvent.setup();
    renderAt("/projects/new");
    await screen.findByLabelText(/TITLE/);
    const preview = screen.getByRole("complementary", { name: "PREVIEW" });

    expect(within(preview).getByRole("heading", { name: "프로젝트 제목" })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/TITLE/), "학습 기록 앱");
    await user.type(screen.getByLabelText(/SUMMARY/), "매일 배운 것을 기록");
    await user.type(screen.getByLabelText(/TECH STACK/), "React, Vite");

    expect(within(preview).getByRole("heading", { name: "학습 기록 앱" })).toBeInTheDocument();
    expect(within(preview).getByText("매일 배운 것을 기록")).toBeInTheDocument();
    expect(within(preview).getAllByRole("listitem").map(item => item.textContent)).toEqual(["React", "Vite"]);
    expect(screen.getByText("11/120")).toBeInTheDocument();
  });

  it("저장 중에는 버튼이 비활성화되고, 성공하면 상세 화면으로 이동한다", async () => {
    let finishSave;
    api.createProject.mockImplementation(() => new Promise(resolve => (finishSave = resolve)));
    api.fetchProjectById.mockResolvedValue({ ...aiProject, id: "new-id", title: "학습 기록 앱" });
    const user = userEvent.setup();
    renderAt("/projects/new");
    await screen.findByLabelText(/TITLE/);

    await user.type(screen.getByLabelText(/TITLE/), "학습 기록 앱");
    await user.type(screen.getByLabelText(/SUMMARY/), "매일 배운 것을 기록");
    await user.type(screen.getByLabelText(/DESCRIPTION/), "설명");
    await user.selectOptions(screen.getByLabelText(/CATEGORY/), "education");
    await user.click(screen.getByRole("button", { name: /등록하기/ }));

    expect(screen.getByRole("button", { name: "저장 중..." })).toBeDisabled();
    expect(api.createProject).toHaveBeenCalledWith(expect.objectContaining({ title: "학습 기록 앱", category: "education" }), expect.any(String));
    finishSave({ ...aiProject, id: "new-id" });

    expect(await screen.findByRole("heading", { level: 1, name: "학습 기록 앱" })).toBeInTheDocument();
    expect(screen.getByText("프로젝트를 등록했습니다.")).toBeInTheDocument();
  });

  it("저장에 실패하면 폼 위에 오류를 보여주고 입력값을 유지한다", async () => {
    api.createProject.mockRejectedValue({ code: "42501", message: "new row violates row-level security policy" });
    const user = userEvent.setup();
    renderAt("/projects/new");
    await screen.findByLabelText(/TITLE/);

    await user.type(screen.getByLabelText(/TITLE/), "제목");
    await user.type(screen.getByLabelText(/SUMMARY/), "요약");
    await user.type(screen.getByLabelText(/DESCRIPTION/), "설명");
    await user.click(screen.getByRole("button", { name: /등록하기/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("권한이 없습니다.");
    expect(screen.getByLabelText(/TITLE/)).toHaveValue("제목");
  });
});

describe("시간 초과 뒤 다시 저장 (중복 등록 방지)", () => {
  it("첫 저장이 시간 초과돼도, 다시 저장할 때 같은 id를 보낸다", async () => {
    api.createProject.mockRejectedValueOnce(new AppError("timeout")).mockResolvedValueOnce({ ...aiProject, id: "new-id" });
    api.fetchProjectById.mockResolvedValue({ ...aiProject, id: "new-id" });
    const user = userEvent.setup();
    renderAt("/projects/new");
    await screen.findByLabelText(/TITLE/);

    await user.type(screen.getByLabelText(/TITLE/), "제목");
    await user.type(screen.getByLabelText(/SUMMARY/), "요약");
    await user.type(screen.getByLabelText(/DESCRIPTION/), "설명");
    await user.click(screen.getByRole("button", { name: /등록하기/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("다시 저장해도 중복으로 등록되지 않습니다.");
    await user.click(screen.getByRole("button", { name: /등록하기/ }));

    expect(await screen.findByRole("heading", { level: 1, name: aiProject.title })).toBeInTheDocument();
    const [firstCall, secondCall] = api.createProject.mock.calls;
    expect(firstCall[1]).toMatch(/^[0-9a-f-]{36}$/);
    expect(secondCall[1]).toBe(firstCall[1]);
  });

  it("등록 화면을 새로 열면 새 id를 쓴다", async () => {
    api.createProject.mockRejectedValue(new AppError("timeout"));
    const user = userEvent.setup();
    const fill = async () => {
      await user.type(await screen.findByLabelText(/TITLE/), "제목");
      await user.type(screen.getByLabelText(/SUMMARY/), "요약");
      await user.type(screen.getByLabelText(/DESCRIPTION/), "설명");
      await user.click(screen.getByRole("button", { name: /등록하기/ }));
      await screen.findByRole("alert");
    };

    const first = renderAt("/projects/new");
    await fill();
    first.unmount();
    renderAt("/projects/new");
    await fill();

    const [firstCall, secondCall] = api.createProject.mock.calls;
    expect(secondCall[1]).not.toBe(firstCall[1]);
  });
});

describe("수정 화면 (/projects/:id/edit)", () => {
  it("기존 값을 채워 보여주고, 저장하면 상세 화면으로 돌아간다", async () => {
    api.fetchProjectById.mockResolvedValue(aiProject);
    api.updateProject.mockResolvedValue({ ...aiProject, title: "새 제목" });
    const user = userEvent.setup();
    renderAt(`/projects/${aiProject.id}/edit`);

    const titleInput = await screen.findByLabelText(/TITLE/);
    expect(titleInput).toHaveValue(aiProject.title);
    expect(screen.getByLabelText(/TECH STACK/)).toHaveValue("React, Supabase");

    await user.clear(titleInput);
    await user.type(titleInput, "새 제목");
    api.fetchProjectById.mockResolvedValue({ ...aiProject, title: "새 제목" });
    await user.click(screen.getByRole("button", { name: /수정 완료/ }));

    await waitFor(() => expect(api.updateProject).toHaveBeenCalledWith(aiProject.id, expect.objectContaining({ title: "새 제목" })));
    expect(await screen.findByRole("heading", { level: 1, name: "새 제목" })).toBeInTheDocument();
    expect(screen.getByText("프로젝트를 수정했습니다.")).toBeInTheDocument();
  });

  it("불러오기에 실패하면 폼 대신 오류를 보여준다", async () => {
    api.fetchProjectById.mockRejectedValue(new TypeError("Failed to fetch"));
    renderAt(`/projects/${aiProject.id}/edit`);

    expect(await screen.findByRole("alert")).toHaveTextContent("네트워크에 연결할 수 없습니다.");
    expect(screen.queryByLabelText(/TITLE/)).not.toBeInTheDocument();
  });
});

describe("홈 Work 섹션", () => {
  it("대표 프로젝트를 먼저 보여준다", async () => {
    api.fetchProjects.mockResolvedValue([eduProject, aiProject]);
    renderAt("/");

    const cards = await screen.findAllByRole("link", { name: /상세 보기/ });
    expect(cards[0]).toHaveAccessibleName(`${aiProject.title} 상세 보기`);
  });
});
