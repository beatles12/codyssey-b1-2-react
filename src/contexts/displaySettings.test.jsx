import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import DisplayControls from "../components/layout/DisplayControls.jsx";
import { setSystemDark } from "../test/browserMocks.js";
import { renderWithProviders } from "../test/renderWithProviders.jsx";

const html = document.documentElement;

describe("테마 (ThemeContext)", () => {
  it("저장값이 없으면 Auto 모드로 시스템 테마를 따른다", () => {
    setSystemDark(true);
    renderWithProviders(<DisplayControls />);

    expect(html.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "시스템 테마 자동 적용" })).toHaveTextContent("Auto ✓");
  });

  it("Auto 모드에서는 운영체제 테마가 바뀌면 화면도 바뀐다", () => {
    renderWithProviders(<DisplayControls />);
    expect(html.dataset.theme).toBe("light");

    act(() => setSystemDark(true));

    expect(html.dataset.theme).toBe("dark");
  });

  it("직접 고른 테마는 저장되고 시스템 변경을 무시한다", async () => {
    renderWithProviders(<DisplayControls />);

    await userEvent.click(screen.getByRole("button", { name: "다크 모드로 변경" }));
    act(() => setSystemDark(false));

    expect(html.dataset.theme).toBe("dark");
    expect(localStorage.getItem("portfolio-theme-mode")).toBe("dark");
    expect(screen.getByRole("button", { name: "시스템 테마 자동 적용" })).toHaveTextContent(/^Auto$/);
    expect(screen.getByRole("button", { name: "라이트 모드로 변경" })).toHaveTextContent("Light");
  });

  it("새로 열어도 저장된 테마를 유지한다", () => {
    localStorage.setItem("portfolio-theme-mode", "dark");
    renderWithProviders(<DisplayControls />);
    expect(html.dataset.theme).toBe("dark");
  });

  it("Auto를 누르면 저장값을 지우고 시스템 테마로 돌아간다", async () => {
    localStorage.setItem("portfolio-theme-mode", "dark");
    renderWithProviders(<DisplayControls />);

    await userEvent.click(screen.getByRole("button", { name: "시스템 테마 자동 적용" }));

    expect(html.dataset.theme).toBe("light");
    expect(localStorage.getItem("portfolio-theme-mode")).toBeNull();
  });
});

describe("언어 (LanguageContext)", () => {
  it("기본은 한국어이고 버튼을 누르면 영어로 바뀌어 저장된다", async () => {
    renderWithProviders(<DisplayControls />);
    expect(html.lang).toBe("ko");

    await userEvent.click(screen.getByRole("button", { name: "Switch to English" }));

    expect(html.lang).toBe("en");
    expect(localStorage.getItem("portfolio-language")).toBe("en");
    expect(screen.getByRole("button", { name: "한국어로 전환" })).toHaveTextContent("KR");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("새로 열어도 저장된 언어를 유지한다", () => {
    localStorage.setItem("portfolio-language", "en");
    renderWithProviders(<DisplayControls />);
    expect(html.lang).toBe("en");
  });
});
