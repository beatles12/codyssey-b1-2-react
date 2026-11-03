import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GithubSection from "./GithubSection.jsx";
import { renderWithProviders } from "../../test/renderWithProviders.jsx";

const githubResponse = [{ name: "codyssey-quiz-game", description: "", language: "Python", html_url: "https://github.com/beatles12/codyssey-quiz-game" }];

describe("GithubSection", () => {
  it("불러오는 동안 로딩을, 성공하면 저장소 카드를 보여준다", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => githubResponse });
    renderWithProviders(<GithubSection />);

    expect(screen.getByRole("status")).toHaveTextContent("GitHub 프로젝트를 불러오는 중입니다.");
    expect(await screen.findByRole("heading", { name: "codyssey-quiz-game" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /GitHub 저장소 열기/ })).toHaveAttribute("target", "_blank");
  });

  it("실패하면 오류를 보여주고 다시 시도로 복구한다", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValueOnce({ ok: true, json: async () => githubResponse });
    renderWithProviders(<GithubSection />);

    expect(await screen.findByRole("alert")).toHaveTextContent("GitHub 프로젝트를 불러올 수 없습니다.");
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByRole("heading", { name: "codyssey-quiz-game" })).toBeInTheDocument();
  });

  it("저장소가 없으면 빈 상태를 보여준다", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [] });
    renderWithProviders(<GithubSection />);
    expect(await screen.findByText("표시할 저장소가 없습니다.")).toBeInTheDocument();
  });
});
