import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { renderWithProviders } from "../test/renderWithProviders.jsx";

describe("HomePage", () => {
  it("B1-1과 같은 순서로 Hero·About·Expertise·Work·Contact 섹션을 보여준다", () => {
    renderWithProviders(<App />);

    const headings = screen.getAllByRole("heading", { level: 2 }).map(heading => heading.getAttribute("aria-label") ?? heading.textContent);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("불편함 속에서 서비스는 시작됩니다.");
    expect(headings).toEqual(
      expect.arrayContaining([
        "사람을 이해하는 마음에서 좋은 서비스가 시작됩니다.",
        "아이디어를 실행으로 옮기는 다양한 역할을 합니다.",
        "생각을 현실로 만든 프로젝트들.",
        "좋은 아이디어를 함께 이야기해요.",
      ]),
    );
    expect(document.querySelector("#contact form")).toBeInTheDocument();
  });

  it("언어를 바꾸면 홈 문구가 영어로 바뀐다", async () => {
    renderWithProviders(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Switch to English" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("Great services begin with understanding people's needs.");
    expect(screen.getByText("I make complex ideas easier to understand through education, consulting, and documentation.")).toBeInTheDocument();
  });
});
