import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "./ContactForm.jsx";
import { renderWithProviders } from "../../test/renderWithProviders.jsx";

/** 세 칸을 모두 올바르게 채운다. */
async function fillForm(user) {
  await user.type(screen.getByLabelText("NAME"), "홍길동");
  await user.type(screen.getByLabelText("EMAIL"), "hong@example.com");
  await user.type(screen.getByLabelText("MESSAGE"), "함께 이야기하고 싶어요.");
}

describe("ContactForm", () => {
  it("빈 칸으로 제출하면 전송하지 않고 오류를 보여준다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /Send Message/ }));

    expect(screen.getByText("이름을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("메시지를 입력해 주세요.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("이메일 형식이 틀리면 알려주고, 고치면 오류가 사라진다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    const email = screen.getByLabelText("EMAIL");

    await user.type(email, "wrong");
    await user.click(screen.getByRole("button", { name: /Send Message/ }));
    expect(screen.getByText("올바른 이메일 형식을 입력해 주세요.")).toBeInTheDocument();

    await user.type(email, "@example.com");
    expect(screen.queryByText("올바른 이메일 형식을 입력해 주세요.")).not.toBeInTheDocument();
  });

  it("전송 중에는 버튼이 비활성화되고, 성공하면 안내 후 입력칸을 비운다", async () => {
    let finishRequest;
    fetch.mockImplementation(() => new Promise(resolve => (finishRequest = resolve)));
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /Send Message/ }));

    expect(screen.getByRole("button", { name: "메시지를 전송하는 중입니다..." })).toBeDisabled();
    finishRequest({ ok: true });

    expect(await screen.findByText("메시지가 정상적으로 전송되었습니다. 감사합니다.")).toBeInTheDocument();
    expect(screen.getByLabelText("NAME")).toHaveValue("");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("formspree.io"), expect.objectContaining({ method: "POST" }));
  });

  it("전송에 실패하면 실패 안내를 보여주고 입력값을 유지한다", async () => {
    fetch.mockResolvedValue({ ok: false, status: 500 });
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /Send Message/ }));

    expect(await screen.findByText("전송에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeInTheDocument();
    expect(screen.getByLabelText("NAME")).toHaveValue("홍길동");
  });
});
